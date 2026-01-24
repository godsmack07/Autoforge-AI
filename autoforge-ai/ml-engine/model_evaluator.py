import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class ModelEvaluator:
    def __init__(self):
        self.metrics = {}
    
    def evaluate(self, model_path, test_data_path):
        """Evaluate trained model on test data"""
        try:
            # Load model
            model_data = joblib.load(model_path)
            model = model_data['model']
            scaler = model_data['scaler']
            feature_columns = model_data['feature_columns']
            target_column = model_data['target_column']
            
            # Load test data
            test_df = pd.read_csv(test_data_path)
            X_test = test_df[feature_columns]
            y_test = test_df[target_column]
            
            # Scale features
            X_test_scaled = scaler.transform(X_test)
            
            # Make predictions
            y_pred = model.predict(X_test_scaled)
            
            # Calculate metrics
            metrics = self.calculate_all_metrics(y_test, y_pred)
            
            # Generate visualization data
            viz_data = self.generate_visualization_data(y_test, y_pred)
            
            # Get prediction intervals
            intervals = self.calculate_prediction_intervals(y_test, y_pred)
            
            # Feature importance analysis
            feature_analysis = self.analyze_feature_importance(model, X_test_scaled, y_test)
            
            return {
                'metrics': metrics,
                'visualization': viz_data,
                'prediction_intervals': intervals,
                'feature_analysis': feature_analysis,
                'samples': {
                    'actual': y_test.tolist()[:20],
                    'predicted': y_pred.tolist()[:20],
                    'errors': (y_test - y_pred).tolist()[:20]
                }
            }
            
        except Exception as e:
            raise Exception(f"Error evaluating model: {str(e)}")
    
    def calculate_all_metrics(self, y_true, y_pred):
        """Calculate all regression metrics"""
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        
        metrics = {
            'mse': float(mean_squared_error(y_true, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_true, y_pred))),
            'mae': float(mean_absolute_error(y_true, y_pred)),
            'r2': float(r2_score(y_true, y_pred)),
            'mape': float(np.mean(np.abs((y_true - y_pred) / np.where(y_true == 0, 1, y_true))) * 100),
            'max_error': float(np.max(np.abs(y_true - y_pred))),
            'explained_variance': float(1 - np.var(y_true - y_pred) / np.var(y_true))
        }
        
        # Additional metrics
        metrics['accuracy'] = float(100 - metrics['mape'])
        metrics['std_error'] = float(np.std(y_true - y_pred))
        
        return metrics
    
    def generate_visualization_data(self, y_true, y_pred):
        """Generate data for visualizations"""
        n_samples = min(100, len(y_true))
        indices = np.random.choice(len(y_true), n_samples, replace=False)
        
        viz_data = {
            'actual_vs_predicted': [
                {'actual': float(y_true[i]), 'predicted': float(y_pred[i]), 'index': int(i)}
                for i in indices
            ],
            'residuals': [
                {'predicted': float(y_pred[i]), 'residual': float(y_true[i] - y_pred[i]), 'index': int(i)}
                for i in indices
            ],
            'error_distribution': self.calculate_error_distribution(y_true, y_pred),
            'prediction_bands': self.calculate_prediction_bands(y_true, y_pred)
        }
        
        return viz_data
    
    def calculate_error_distribution(self, y_true, y_pred):
        """Calculate error distribution statistics"""
        errors = y_true - y_pred
        
        return {
            'mean': float(np.mean(errors)),
            'std': float(np.std(errors)),
            'skewness': float(pd.Series(errors).skew()),
            'kurtosis': float(pd.Series(errors).kurtosis()),
            'percentiles': {
                '5th': float(np.percentile(errors, 5)),
                '25th': float(np.percentile(errors, 25)),
                '50th': float(np.percentile(errors, 50)),
                '75th': float(np.percentile(errors, 75)),
                '95th': float(np.percentile(errors, 95))
            }
        }
    
    def calculate_prediction_bands(self, y_true, y_pred, confidence=0.95):
        """Calculate prediction confidence bands"""
        residuals = y_true - y_pred
        std_residuals = np.std(residuals)
        
        from scipy import stats
        z_score = stats.norm.ppf((1 + confidence) / 2)
        
        return {
            'confidence_level': confidence,
            'upper_band': (y_pred + z_score * std_residuals).tolist(),
            'lower_band': (y_pred - z_score * std_residuals).tolist(),
            'band_width': float(2 * z_score * std_residuals)
        }
    
    def calculate_prediction_intervals(self, y_true, y_pred, confidence=0.95):
        """Calculate prediction intervals"""
        residuals = y_true - y_pred
        std_residuals = np.std(residuals)
        
        from scipy import stats
        t_value = stats.t.ppf((1 + confidence) / 2, len(residuals) - 1)
        
        return {
            'confidence': confidence,
            'interval': float(t_value * std_residuals),
            'coverage': float(np.mean(
                (y_pred - t_value * std_residuals <= y_true) & 
                (y_true <= y_pred + t_value * std_residuals)
            ) * 100)
        }
    
    def analyze_feature_importance(self, model, X, y_true):
        """Analyze feature importance and contribution"""
        importance = {}
        
        # Get feature importance if available
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            importance['values'] = importances.tolist()
            importance['ranked'] = sorted(
                [(i, imp) for i, imp in enumerate(importances)],
                key=lambda x: x[1], reverse=True
            )
        
        # Calculate correlation with residuals
        y_pred = model.predict(X)
        residuals = y_true - y_pred
        
        correlations = []
        for i in range(X.shape[1]):
            corr = np.corrcoef(X[:, i], residuals)[0, 1]
            correlations.append(float(corr))
        
        importance['residual_correlations'] = correlations
        
        return importance
    
    def cross_validate(self, model, X, y, cv=5):
        """Perform cross-validation"""
        from sklearn.model_selection import cross_val_score
        
        cv_scores = cross_val_score(
            model, X, y, cv=cv, 
            scoring='neg_mean_squared_error'
        )
        
        return {
            'mean_mse': float(-cv_scores.mean()),
            'std_mse': float(cv_scores.std()),
            'cv_scores': (-cv_scores).tolist()
        }