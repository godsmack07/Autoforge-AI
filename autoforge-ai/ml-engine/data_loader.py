import pandas as pd
import numpy as np
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class DataLoader:
    def __init__(self):
        self.sample_datasets = {
            'titanic': self.load_titanic,
            'housing': self.load_housing,
            'diabetes': self.load_diabetes,
            'sales': self.load_sales,
            'stocks': self.load_stocks
        }
    
    def analyze_csv(self, file_path, sample_rows=100):
        """Analyze CSV file for data quality issues"""
        try:
            # Read CSV
            df = pd.read_csv(file_path, nrows=sample_rows)
            
            analysis = {
                'filename': file_path.split('/')[-1],
                'total_rows': len(pd.read_csv(file_path, nrows=None)),
                'sampled_rows': len(df),
                'columns': len(df.columns),
                'headers': df.columns.tolist(),
                'dtypes': df.dtypes.astype(str).to_dict(),
                'missing_values': df.isnull().sum().to_dict(),
                'missing_percentage': (df.isnull().sum() / len(df) * 100).to_dict(),
                'duplicates': df.duplicated().sum(),
                'statistics': {},
                'issues': [],
                'sample_data': df.head(5).to_dict('records')
            }
            
            # Calculate statistics for numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                analysis['statistics'][col] = {
                    'mean': float(df[col].mean()),
                    'std': float(df[col].std()),
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                    'median': float(df[col].median())
                }
            
            # Detect issues
            for col in df.columns:
                # Missing values
                missing = df[col].isnull().sum()
                if missing > 0:
                    analysis['issues'].append({
                        'type': 'missing_values',
                        'column': col,
                        'count': int(missing),
                        'percentage': float(missing / len(df) * 100),
                        'severity': 'high' if missing / len(df) > 0.1 else 'medium'
                    })
                
                # Outliers for numeric columns
                if col in numeric_cols:
                    q1 = df[col].quantile(0.25)
                    q3 = df[col].quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)][col].count()
                    
                    if outliers > 0:
                        analysis['issues'].append({
                            'type': 'outliers',
                            'column': col,
                            'count': int(outliers),
                            'percentage': float(outliers / len(df) * 100),
                            'severity': 'medium'
                        })
                
                # Constant values
                unique_values = df[col].nunique()
                if unique_values == 1:
                    analysis['issues'].append({
                        'type': 'constant_column',
                        'column': col,
                        'value': df[col].iloc[0],
                        'severity': 'low'
                    })
            
            return analysis
            
        except Exception as e:
            raise Exception(f"Error analyzing CSV: {str(e)}")
    
    def load_titanic(self):
        """Load Titanic dataset"""
        from sklearn.datasets import fetch_openml
        titanic = fetch_openml('titanic', version=1, as_frame=True)
        df = titanic.frame
        df = df.dropna()
        return df
    
    def load_housing(self):
        """Load California housing dataset"""
        from sklearn.datasets import fetch_california_housing
        housing = fetch_california_housing(as_frame=True)
        df = housing.frame
        return df
    
    def load_diabetes(self):
        """Load diabetes dataset"""
        from sklearn.datasets import load_diabetes
        diabetes = load_diabetes(as_frame=True)
        df = diabetes.frame
        return df
    
    def load_sales(self):
        """Generate synthetic sales data"""
        np.random.seed(42)
        n_samples = 1000
        df = pd.DataFrame({
            'month': np.random.randint(1, 13, n_samples),
            'year': np.random.randint(2019, 2024, n_samples),
            'product_id': np.random.choice(['A', 'B', 'C', 'D'], n_samples),
            'quantity': np.random.randint(1, 100, n_samples),
            'price': np.random.uniform(10, 1000, n_samples),
            'customer_rating': np.random.uniform(1, 5, n_samples),
            'sales': np.random.uniform(1000, 100000, n_samples)
        })
        return df
    
    def load_stocks(self):
        """Generate synthetic stock data"""
        np.random.seed(42)
        dates = pd.date_range('2020-01-01', periods=1000, freq='D')
        df = pd.DataFrame({
            'date': dates,
            'open': np.cumsum(np.random.randn(1000)) + 100,
            'high': np.cumsum(np.random.randn(1000)) + 105,
            'low': np.cumsum(np.random.randn(1000)) + 95,
            'close': np.cumsum(np.random.randn(1000)) + 102,
            'volume': np.random.randint(1000000, 10000000, 1000),
            'return': np.random.randn(1000) * 0.02
        })
        return df
    
    def get_random_dataset(self):
        """Get a random sample dataset"""
        import random
        dataset_name = random.choice(list(self.sample_datasets.keys()))
        return self.sample_datasets[dataset_name]()