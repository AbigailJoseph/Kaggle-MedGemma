"""
Complete pulmonary differential diagnosis network data
Generated from MedGemma-27B clinical expert probabilities
"""

PULMONARY_NETWORK_DATA = {
    'diseases': [
        {'name': 'Asbestosis', 'prior': 0.05},
        {'name': 'Edema', 'prior': 0.10},
        {'name': 'Pneumonia', 'prior': 0.15},
        {'name': 'Hemorrhage', 'prior': 0.02},
        {'name': 'Fibrosis', 'prior': 0.03},
        {'name': 'Infection', 'prior': 0.12},
        {'name': 'LV_Decomp', 'prior': 0.08},
        {'name': 'COPD', 'prior': 0.10},
        {'name': 'PE', 'prior': 0.05}
    ],
    'symptoms': [
        {
            'name': 'Progressive_Dyspnea',
            'leak': 0.05,
            'causes': [
                {'disease': 'Asbestosis', 'probability': 0.75},
                {'disease': 'Edema', 'probability': 0.85},
                {'disease': 'Pneumonia', 'probability': 0.60},
                {'disease': 'Hemorrhage', 'probability': 0.70},
                {'disease': 'Fibrosis', 'probability': 0.80},
                {'disease': 'Infection', 'probability': 0.65},
                {'disease': 'LV_Decomp', 'probability': 0.90},
                {'disease': 'COPD', 'probability': 0.85},
                {'disease': 'PE', 'probability': 0.70}
            ]
        },
        {
            'name': 'Crackles',
            'leak': 0.02,
            'causes': [
                {'disease': 'Asbestosis', 'probability': 0.70},
                {'disease': 'Edema', 'probability': 0.90},
                {'disease': 'Pneumonia', 'probability': 0.80},
                {'disease': 'Hemorrhage', 'probability': 0.60},
                {'disease': 'Fibrosis', 'probability': 0.85},
                {'disease': 'Infection', 'probability': 0.75},
                {'disease': 'LV_Decomp', 'probability': 0.95},
                {'disease': 'COPD', 'probability': 0.40},
                {'disease': 'PE', 'probability': 0.30}
            ]
        },
        {
            'name': 'Hypoxemia',
            'leak': 0.01,
            'causes': [
                {'disease': 'Asbestosis', 'probability': 0.75},
                {'disease': 'Edema', 'probability': 0.90},
                {'disease': 'Pneumonia', 'probability': 0.85},
                {'disease': 'Hemorrhage', 'probability': 0.80},
                {'disease': 'Fibrosis', 'probability': 0.80},
                {'disease': 'Infection', 'probability': 0.80},
                {'disease': 'LV_Decomp', 'probability': 0.95},
                {'disease': 'COPD', 'probability': 0.90},
                {'disease': 'PE', 'probability': 0.85}
            ]
        },
        {
            'name': 'Tachypnea',
            'leak': 0.03,
            'causes': [
                {'disease': 'Asbestosis', 'probability': 0.60},
                {'disease': 'Edema', 'probability': 0.80},
                {'disease': 'Pneumonia', 'probability': 0.70},
                {'disease': 'Hemorrhage', 'probability': 0.65},
                {'disease': 'Fibrosis', 'probability': 0.65},
                {'disease': 'Infection', 'probability': 0.75},
                {'disease': 'LV_Decomp', 'probability': 0.90},
                {'disease': 'COPD', 'probability': 0.85},
                {'disease': 'PE', 'probability': 0.80}
            ]
        },
        {
            'name': 'Fever',
            'leak': 0.01,
            'causes': [
                {'disease': 'Pneumonia', 'probability': 0.90},
                {'disease': 'Infection', 'probability': 0.95}
            ]
        },
        {
            'name': 'Chest_Pain',
            'leak': 0.02,
            'causes': [
                {'disease': 'Asbestosis', 'probability': 0.10},
                {'disease': 'Edema', 'probability': 0.30},
                {'disease': 'Pneumonia', 'probability': 0.40},
                {'disease': 'Hemorrhage', 'probability': 0.35},
                {'disease': 'Fibrosis', 'probability': 0.15},
                {'disease': 'Infection', 'probability': 0.25},
                {'disease': 'LV_Decomp', 'probability': 0.40},
                {'disease': 'COPD', 'probability': 0.20},
                {'disease': 'PE', 'probability': 0.85}
            ]
        },
        {
            'name': 'Hemoptysis',
            'leak': 0.005,
            'causes': [
                {'disease': 'Hemorrhage', 'probability': 0.95},
                {'disease': 'PE', 'probability': 0.20},
                {'disease': 'Pneumonia', 'probability': 0.15},
                {'disease': 'Edema', 'probability': 0.10},
                {'disease': 'Infection', 'probability': 0.10}
            ]
        },
        {
            'name': 'Elevated_JVP',
            'leak': 0.01,
            'causes': [
                {'disease': 'LV_Decomp', 'probability': 0.95},
                {'disease': 'Edema', 'probability': 0.70},
                {'disease': 'PE', 'probability': 0.40},
                {'disease': 'COPD', 'probability': 0.30},
                {'disease': 'Fibrosis', 'probability': 0.20}
            ]
        },
        {
            'name': 'Bilateral_Opacities',
            'leak': 0.01,
            'causes': [
                {'disease': 'Edema', 'probability': 0.95},
                {'disease': 'Pneumonia', 'probability': 0.90},
                {'disease': 'LV_Decomp', 'probability': 0.90},
                {'disease': 'Hemorrhage', 'probability': 0.85},
                {'disease': 'Infection', 'probability': 0.80},
                {'disease': 'Fibrosis', 'probability': 0.40}
            ]
        },
        {
            'name': 'RV_Dysfunction',
            'leak': 0.005,
            'causes': [
                {'disease': 'PE', 'probability': 0.80},
                {'disease': 'COPD', 'probability': 0.60},
                {'disease': 'Fibrosis', 'probability': 0.50},
                {'disease': 'Asbestosis', 'probability': 0.40},
                {'disease': 'LV_Decomp', 'probability': 0.30}
            ]
        },
        {
            'name': 'Calcified_Plaques',
            'leak': 0.001,
            'causes': [
                {'disease': 'Asbestosis', 'probability': 0.95}
            ]
        },
        {
            'name': 'Pulm_Hypertension',
            'leak': 0.005,
            'causes': [
                {'disease': 'PE', 'probability': 0.85},
                {'disease': 'COPD', 'probability': 0.70},
                {'disease': 'Fibrosis', 'probability': 0.60},
                {'disease': 'Asbestosis', 'probability': 0.40}
            ]
        },
        {
            'name': 'Altered_Mental_Status',
            'leak': 0.01,
            'causes': [
                {'disease': 'LV_Decomp', 'probability': 0.40},
                {'disease': 'Infection', 'probability': 0.30},
                {'disease': 'COPD', 'probability': 0.25},
                {'disease': 'Pneumonia', 'probability': 0.20},
                {'disease': 'PE', 'probability': 0.15},
                {'disease': 'Edema', 'probability': 0.15}
            ]
        }
    ]
}


# Symptom display names for better output
SYMPTOM_DISPLAY_NAMES = {
    'Progressive_Dyspnea': 'Progressive Dyspnea',
    'Crackles': 'Crackles/Rales',
    'Hypoxemia': 'Hypoxemia',
    'Tachypnea': 'Tachypnea',
    'Fever': 'Fever',
    'Chest_Pain': 'Chest Pain',
    'Hemoptysis': 'Hemoptysis',
    'Elevated_JVP': 'Elevated JVP',
    'Bilateral_Opacities': 'Bilateral Air-Space Opacities',
    'RV_Dysfunction': 'Right Ventricular Dysfunction',
    'Calcified_Plaques': 'Calcified Pleural Plaques',
    'Pulm_Hypertension': 'Pulmonary Hypertension',
    'Altered_Mental_Status': 'Altered Mental Status'
}

DISEASE_DISPLAY_NAMES = {
    'Asbestosis': 'Pulmonary Asbestosis',
    'Edema': 'Pulmonary Edema',
    'Pneumonia': 'Pneumonia',
    'Hemorrhage': 'Pulmonary Hemorrhage',
    'Fibrosis': 'Accelerated Pulmonary Fibrosis',
    'Infection': 'Infection (bacterial/viral/fungal)',
    'LV_Decomp': 'Acute LV Decompensation',
    'COPD': 'COPD Exacerbation',
    'PE': 'Pulmonary Embolism'
}
