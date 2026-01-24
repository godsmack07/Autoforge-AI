import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.impute import SimpleImputer
import warnings
warnings.filterwarnings('ignore')

class DataCleaner:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
    
    def clean_data(self, file_path, options):
        """
        Clean data based on options
        
        Options:
        - remove_missing: bool - Remove rows with missing values
        - fill_missing: bool - Fill missing values
        - fill_strategy: str - 'mean', 'median', 'mode', 'constant'
        - fill_value: any - Value to use for constant filling
        - remove_duplicates: bool - Remove duplicate rows
        - normalize: bool - Normalize numerical columns
        - encode_categorical: bool - Encode categorical variables
        - remove_outliers: bool - Remove outliers
        - outlier_method: str - 'iqr', 'zscore'
        - selected_columns: list - Columns to include
        - row_range: dict - {start: int, end: int}
        """
        try:
            # Load data
            df = pd.read_csv(file_path)
            
            # Apply row range
            if options.get('row_range'):
                start = options['row_range'].get('start', 1) - 1  # Convert to 0-index
                end = options['row_range'].get('end', -1)
                
                if start < 0:
                    start = 0
                if end == -1 or end > len(df):
                    end = len(df)
                
                df = df.iloc[start:end]
            
            # Select columns
            selected_columns = options.get('selected_columns', [])
            if selected_columns:
                df = df[selected_columns]
            
            # Remove missing values
            if options.get('remove_missing'):
                df = df.dropna()
            
            # Fill missing values
            elif options.get('fill_missing'):
                strategy = options.get('fill_strategy', 'mean')
                fill_value = options.get('fill_value', 0)
                
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                categorical_cols = df.select_dtypes(exclude=[np.number]).columns
                
                if strategy == 'constant':
                    df[numeric_cols] = df[numeric_cols].fillna(fill_value)
                    df[categorical_cols] = df[categorical_cols].fillna('missing')
                else:
                    imputer = SimpleImputer(strategy=strategy)
                    df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
                    df[categorical_cols] = df[categorical_cols].fillna('missing')
            
            # Remove duplicates
            if options.get('remove_duplicates'):
                df = df.drop_duplicates()
            
            # Remove outliers
            if options.get('remove_outliers'):
                df = self.remove_outliers(df, options.get('outlier_method', 'iqr'))
            
            # Normalize numerical columns
            if options.get('normalize'):
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                if len(numeric_cols) > 0:
                    scaler = StandardScaler()
                    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
            
            # Encode categorical variables
            if options.get('encode_categorical'):
                categorical_cols = df.select_dtypes(exclude=[np.number]).columns
                for col in categorical_cols:
                    le = LabelEncoder()
                    df[col] = le.fit_transform(df[col])
                    self.label_encoders[col] = le
            
            # Generate cleaning statistics
            stats = {
                'original_rows': len(pd.read_csv(file_path, nrows=None)),
                'cleaned_rows': len(df),
                'original_columns': len(pd.read_csv(file_path, nrows=1).columns),
                'cleaned_columns': len(df.columns),
                'missing_removed': options.get('missing_count', 0),
                'duplicates_removed': options.get('duplicate_count', 0),
                'outliers_removed': options.get('outlier_count', 0)
            }
            
            return {
                'data': df.to_dict('records'),
                'columns': df.columns.tolist(),
                'dtypes': df.dtypes.astype(str).to_dict(),
                'stats': stats,
                'sample': df.head(10).to_dict('records')
            }
            
        except Exception as e:
            raise Exception(f"Error cleaning data: {str(e)}")
    
    def remove_outliers(self, df, method='iqr'):
        """Remove outliers using IQR or Z-score method"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if method == 'iqr':
            for col in numeric_cols:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
        
        elif method == 'zscore':
            for col in numeric_cols:
                z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                df = df[z_scores < 3]
        
        return df
    
    def detect_data_types(self, df):
        """Detect data types of columns"""
        types = {}
        for col in df.columns:
            col_data = df[col].dropna()
            if len(col_data) == 0:
                types[col] = 'unknown'
                continue
            
            # Try to convert to numeric
            try:
                pd.to_numeric(col_data)
                types[col] = 'numeric'
            except:
                # Check if it's datetime
                try:
                    pd.to_datetime(col_data)
                    types[col] = 'datetime'
                except:
                    # Check unique values for categorical
                    unique_ratio = col_data.nunique() / len(col_data)
                    if unique_ratio < 0.5:
                        types[col] = 'categorical'
                    else:
                        types[col] = 'text'
        
        return types