import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import time
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

from model_regressors import RegressionModels

class ModelTrainer:
    def __init__(self):
        self.regression_models = RegressionModels()
        self.scaler = StandardScaler()
        self.models_dir = 'models'
        
    def train(self, data_path, model_type, target_column, feature_columns, split_ratios):
        """
        Train a regression model
        
        Parameters:
        - data_path: path to CSV file
        - model_type: type of regression model
        - target_column: name of target column
        - feature_columns: list of feature column names
        - split_ratios: dict with train, val, test percentages
        """
        try:
            # Load data
            df = pd.read_csv(data_path)
            
            # Prepare features and target
            X = df[feature_columns]
            y = df[target_column]
            
            # Split data
            train_size = split_ratios.get('train', 70) / 100
            val_size = split_ratios.get('val', 15) / 100
            test_size = split_ratios.get('test', 15) / 100
            
            # First split: train+val vs test
            X_temp, X_test, y_temp, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )
            
            # Second split: train vs val
            val_ratio = val_size / (train_size + val_size)
            X_train, X_val, y_train, y_val = train_test_split(
                X_temp, y_temp, test_size=val_ratio, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Get model
            model = self.regression_models.get_model(model_type)
            
            # Train model
            start_time = time.time()
            model.fit(X_train_scaled, y_train)
            training_time = time.time() - start_time
            
            # Make predictions
            y_train_pred = model.predict(X_train_scaled)
            y_val_pred = model.predict(X_val_scaled)
            y_test_pred = model.predict(X_test_scaled)
            
            # Calculate metrics
            train_metrics = self.calculate_metrics(y_train, y_train_pred)
            val_metrics = self.calculate_metrics(y_val, y_val_pred)
            test_metrics = self.calculate_metrics(y_test, y_test_pred)
            
            # Get feature importance if available
            feature_importance = self.get_feature_importance(model, feature_columns)
            
            # Save model
            model_id = f"{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            model_path = f"{self.models_dir}/{model_id}.pkl"
            
            # Create model info
            model_info = {
                'model_id': model_id,
                'model_type': model_type,
                'model_name': self.regression_models.models[model_type]['name'],
                'training_time': training_time,
                'timestamp': datetime.now().isoformat(),
                'target_column': target_column,
                'feature_columns': feature_columns,
                'split_ratios': split_ratios,
                'data_shape': {
                    'total_samples': len(df),
                    'train_samples': len(X_train),
                    'val_samples': len(X_val),
                    'test_samples': len(X_test)
                },
                'metrics': {
                    'train': train_metrics,
                    'validation': val_metrics,
                    'test': test_metrics
                },
                'feature_importance': feature_importance,
                'model_path': model_path
            }
            
            # Save model and scaler
            model_data = {
                'model': model,
                'scaler': self.scaler,
                'feature_columns': feature_columns,
                'target_column': target_column,
                'model_info': model_info
            }
            
            joblib.dump(model_data, model_path)
            
            return model_info
            
        except Exception as e:
            raise Exception(f"Error training model: {str(e)}")
    
    def calculate_metrics(self, y_true, y_pred):
        """Calculate regression metrics"""
        return {
            'mse': float(mean_squared_error(y_true, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_true, y_pred))),
            'mae': float(mean_absolute_error(y_true, y_pred)),
            'r2': float(r2_score(y_true, y_pred)),
            'mape': float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)
        }
    
    def get_feature_importance(self, model, feature_names):
        """Get feature importance from model if available"""
        importance = {}
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            for name, imp in zip(feature_names, importances):
                importance[name] = float(imp)
        
        elif hasattr(model, 'coef_'):
            coefficients = model.coef_
            if len(coefficients.shape) == 1:
                for name, coef in zip(feature_names, coefficients):
                    importance[name] = float(coef)
            else:
                # Multi-output
                for i in range(coefficients.shape[0]):
                    for j, name in enumerate(feature_names):
                        importance[f'{name}_output{i}'] = float(coefficients[i, j])
        
        return importance
    
    def hyperparameter_tuning(self, model_type, X, y, param_grid, cv=3):
        """Perform hyperparameter tuning"""
        from sklearn.model_selection import GridSearchCV
        
        model = self.regression_models.get_model(model_type)
        grid_search = GridSearchCV(
            model, param_grid, cv=cv, scoring='r2', n_jobs=-1
        )
        
        grid_search.fit(X, y)
        
        return {
            'best_params': grid_search.best_params_,
            'best_score': float(grid_search.best_score_),
            'cv_results': grid_search.cv_results_
        }
    
    def get_recommended_split(self, n_samples):
        """Get recommended train/val/test split based on data size"""
        if n_samples < 100:
            return {'train': 80, 'val': 20, 'test': 0}
        elif n_samples < 1000:
            return {'train': 70, 'val': 15, 'test': 15}
        elif n_samples < 10000:
            return {'train': 80, 'val': 10, 'test': 10}
        else:
            return {'train': 85, 'val': 10, 'test': 5}