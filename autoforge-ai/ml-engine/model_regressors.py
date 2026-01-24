import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neural_network import MLPRegressor
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostRegressor
import warnings
warnings.filterwarnings('ignore')

class RegressionModels:
    def __init__(self):
        self.models = {
            'linear': {
                'name': 'Linear Regression',
                'class': LinearRegression,
                'description': 'Simple linear relationship between features and target',
                'parameters': {
                    'fit_intercept': [True, False],
                    'normalize': [True, False]
                }
            },
            'ridge': {
                'name': 'Ridge Regression',
                'class': Ridge,
                'description': 'Linear regression with L2 regularization',
                'parameters': {
                    'alpha': [0.1, 1.0, 10.0],
                    'fit_intercept': [True, False]
                }
            },
            'lasso': {
                'name': 'Lasso Regression',
                'class': Lasso,
                'description': 'Linear regression with L1 regularization',
                'parameters': {
                    'alpha': [0.1, 1.0, 10.0],
                    'fit_intercept': [True, False]
                }
            },
            'elasticnet': {
                'name': 'Elastic Net',
                'class': ElasticNet,
                'description': 'Linear regression with L1 + L2 regularization',
                'parameters': {
                    'alpha': [0.1, 1.0, 10.0],
                    'l1_ratio': [0.1, 0.5, 0.9]
                }
            },
            'decision_tree': {
                'name': 'Decision Tree',
                'class': DecisionTreeRegressor,
                'description': 'Tree-based regression model',
                'parameters': {
                    'max_depth': [3, 5, 10, None],
                    'min_samples_split': [2, 5, 10]
                }
            },
            'random_forest': {
                'name': 'Random Forest',
                'class': RandomForestRegressor,
                'description': 'Ensemble of decision trees',
                'parameters': {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [3, 5, 10, None],
                    'min_samples_split': [2, 5, 10]
                }
            },
            'gradient_boosting': {
                'name': 'Gradient Boosting',
                'class': GradientBoostingRegressor,
                'description': 'Sequential tree boosting',
                'parameters': {
                    'n_estimators': [50, 100, 200],
                    'learning_rate': [0.01, 0.1, 0.3],
                    'max_depth': [3, 5, 10]
                }
            },
            'xgboost': {
                'name': 'XGBoost',
                'class': xgb.XGBRegressor,
                'description': 'Optimized gradient boosting',
                'parameters': {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [3, 5, 10],
                    'learning_rate': [0.01, 0.1, 0.3]
                }
            },
            'lightgbm': {
                'name': 'LightGBM',
                'class': lgb.LGBMRegressor,
                'description': 'Light Gradient Boosting Machine',
                'parameters': {
                    'n_estimators': [50, 100, 200],
                    'num_leaves': [31, 50, 100],
                    'learning_rate': [0.01, 0.1, 0.3]
                }
            },
            'catboost': {
                'name': 'CatBoost',
                'class': CatBoostRegressor,
                'description': 'Categorical boosting',
                'parameters': {
                    'iterations': [50, 100, 200],
                    'depth': [3, 5, 10],
                    'learning_rate': [0.01, 0.1, 0.3]
                }
            },
            'svr': {
                'name': 'Support Vector Regressor',
                'class': SVR,
                'description': 'Support Vector Machine for regression',
                'parameters': {
                    'kernel': ['linear', 'rbf', 'poly'],
                    'C': [0.1, 1.0, 10.0],
                    'epsilon': [0.1, 0.2, 0.3]
                }
            },
            'neural_network': {
                'name': 'Neural Network',
                'class': MLPRegressor,
                'description': 'Multi-layer Perceptron regressor',
                'parameters': {
                    'hidden_layer_sizes': [(50,), (100,), (50, 50)],
                    'activation': ['relu', 'tanh'],
                    'alpha': [0.0001, 0.001, 0.01]
                }
            }
        }
    
    def get_available_models(self):
        """Return list of available models with details"""
        models_list = []
        for key, model_info in self.models.items():
            models_list.append({
                'id': key,
                'name': model_info['name'],
                'description': model_info['description'],
                'parameters': model_info['parameters']
            })
        return models_list
    
    def get_model(self, model_type, params=None):
        """Get model instance by type"""
        if model_type not in self.models:
            raise ValueError(f"Unknown model type: {model_type}")
        
        model_info = self.models[model_type]
        if params:
            return model_info['class'](**params)
        else:
            return model_info['class']()
    
    def recommend_model(self, data_info):
        """
        Recommend best model based on data characteristics
        
        data_info: dict with keys
        - n_samples: number of samples
        - n_features: number of features
        - feature_types: dict of feature data types
        - problem_type: 'regression'
        """
        n_samples = data_info.get('n_samples', 1000)
        n_features = data_info.get('n_features', 10)
        
        recommendations = []
        
        # Simple rules for recommendation
        if n_samples < 1000:
            recommendations.extend(['linear', 'ridge', 'lasso', 'decision_tree'])
        elif n_samples < 10000:
            recommendations.extend(['random_forest', 'gradient_boosting', 'xgboost', 'lightgbm'])
        else:
            recommendations.extend(['xgboost', 'lightgbm', 'catboost'])
        
        if n_features > 100:
            recommendations.extend(['lasso', 'elasticnet', 'xgboost'])
        
        # Remove duplicates and return
        return list(dict.fromkeys(recommendations))
    
    def get_model_comparison(self, X, y, cv=3):
        """Compare all models on given data"""
        from sklearn.model_selection import cross_val_score
        import time
        
        results = []
        
        for model_type, model_info in self.models.items():
            try:
                model = self.get_model(model_type)
                
                start_time = time.time()
                scores = cross_val_score(model, X, y, cv=cv, scoring='r2')
                training_time = time.time() - start_time
                
                results.append({
                    'model': model_info['name'],
                    'type': model_type,
                    'mean_r2': float(np.mean(scores)),
                    'std_r2': float(np.std(scores)),
                    'training_time': training_time,
                    'status': 'success'
                })
                
            except Exception as e:
                results.append({
                    'model': model_info['name'],
                    'type': model_type,
                    'error': str(e),
                    'status': 'failed'
                })
        
        # Sort by mean R² score
        results = sorted([r for r in results if r['status'] == 'success'], 
                        key=lambda x: x['mean_r2'], reverse=True)
        
        return results