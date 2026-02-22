"""
Noisy-OR Bayesian Network for Pulmonary Differential Diagnosis
Ground truth system for medical AI assistant
"""

import json
from typing import Dict, List, Optional, Set
from collections import defaultdict
import itertools


class NoisyORBayesNet:
    """
    Bayesian Network using Noisy-OR models for pulmonary disease differential diagnosis.
    
    Provides ground truth probabilities that can be used to validate LLM outputs
    and prevent hallucination in medical diagnosis.
    """
    
    def __init__(self, network_data: Dict):
        """
        Initialize network from structured data.
        
        Args:
            network_data: Dict with 'diseases' and 'symptoms' keys
        """
        self.diseases = {d['name']: d for d in network_data['diseases']}
        self.symptoms = {s['name']: s for s in network_data['symptoms']}
        
        # Current evidence (observed symptoms)
        self.evidence = {}
        
        # Build parent-child relationships
        self._build_network_structure()
        
    def _build_network_structure(self):
        """Build directed graph structure from symptom-disease relationships"""
        self.symptom_to_diseases = {}  # symptom -> list of diseases that cause it
        self.disease_to_symptoms = defaultdict(list)  # disease -> list of symptoms it causes
        
        for symptom_name, symptom_data in self.symptoms.items():
            causes = []
            for cause in symptom_data['causes']:
                disease_name = cause['disease']
                probability = cause['probability']
                causes.append({'disease': disease_name, 'probability': probability})
                self.disease_to_symptoms[disease_name].append(symptom_name)
            
            self.symptom_to_diseases[symptom_name] = causes
    
    def _noisy_or(self, symptom_name: str, disease_states: Dict[str, bool]) -> float:
        """
        Calculate P(Symptom=Present | disease states) using Noisy-OR.
        
        Args:
            symptom_name: Name of symptom
            disease_states: Dict of {disease_name: True/False}
            
        Returns:
            Probability that symptom is present
        """
        symptom_data = self.symptoms[symptom_name]
        leak = symptom_data['leak']
        
        # Start with leak failure rate
        inhibition = 1.0 - leak
        
        # Multiply by failure rate of each present disease
        for cause in symptom_data['causes']:
            disease = cause['disease']
            probability = cause['probability']
            
            if disease_states.get(disease, False):
                # Disease is present - multiply by its failure rate
                inhibition *= (1.0 - probability)
        
        # P(Symptom present) = 1 - P(all mechanisms fail)
        return 1.0 - inhibition
    
    def set_evidence(self, observations: Dict[str, bool]):
        """
        Set observed symptoms.
        
        Args:
            observations: Dict of {symptom_name: True/False}
        """
        self.evidence = observations.copy()
    
    def clear_evidence(self):
        """Clear all evidence"""
        self.evidence = {}
    
    def _enumerate_disease_combinations(self) -> List[Dict[str, bool]]:
        """
        Generate all possible combinations of disease states.
        
        Returns:
            List of dicts, each representing one combination
        """
        disease_names = list(self.diseases.keys())
        n_diseases = len(disease_names)
        
        combinations = []
        for i in range(2 ** n_diseases):
            binary = format(i, f'0{n_diseases}b')
            state = {disease_names[j]: (binary[j] == '1') 
                    for j in range(n_diseases)}
            combinations.append(state)
        
        return combinations
    
    def _likelihood_given_diseases(self, disease_states: Dict[str, bool]) -> float:
        """
        Calculate P(Evidence | disease states) using Noisy-OR for each symptom.
        
        Args:
            disease_states: Dict of {disease_name: True/False}
            
        Returns:
            Probability of observed evidence given these disease states
        """
        likelihood = 1.0
        
        for symptom_name, observed_value in self.evidence.items():
            if symptom_name not in self.symptoms:
                continue
                
            # Calculate P(Symptom | diseases) using Noisy-OR
            p_symptom_present = self._noisy_or(symptom_name, disease_states)
            
            # Likelihood contribution
            if observed_value:  # Symptom is present
                likelihood *= p_symptom_present
            else:  # Symptom is absent
                likelihood *= (1.0 - p_symptom_present)
        
        return likelihood
    
    def query_disease(self, disease_name: str) -> float:
        """
        Calculate P(Disease | Evidence) using exact inference.
        
        Args:
            disease_name: Name of disease to query
            
        Returns:
            Posterior probability of disease given evidence
        """
        if disease_name not in self.diseases:
            raise ValueError(f"Unknown disease: {disease_name}")
        
        # Enumerate all disease combinations
        combinations = self._enumerate_disease_combinations()
        
        # Calculate P(Disease=True, Evidence) and P(Evidence)
        numerator = 0.0  # P(Disease=True, Evidence)
        denominator = 0.0  # P(Evidence)
        
        for disease_states in combinations:
            # Prior probability of this disease combination
            prior = 1.0
            for disease, is_present in disease_states.items():
                disease_prior = self.diseases[disease]['prior']
                if is_present:
                    prior *= disease_prior
                else:
                    prior *= (1.0 - disease_prior)
            
            # Likelihood of evidence given these diseases
            likelihood = self._likelihood_given_diseases(disease_states)
            
            # Joint probability
            joint = prior * likelihood
            
            # Accumulate
            denominator += joint
            if disease_states[disease_name]:
                numerator += joint
        
        # Posterior = P(Disease, Evidence) / P(Evidence)
        if denominator == 0:
            return 0.0
        
        return numerator / denominator
    
    def query_all_diseases(self) -> Dict[str, float]:
        """
        Calculate posterior probabilities for all diseases.
        
        Returns:
            Dict of {disease_name: probability}
        """
        return {disease: self.query_disease(disease) 
                for disease in self.diseases.keys()}
    
    def most_likely_disease(self) -> tuple:
        """
        Find the most likely disease given evidence.
        
        Returns:
            (disease_name, probability)
        """
        posteriors = self.query_all_diseases()
        return max(posteriors.items(), key=lambda x: x[1])
    
    def rank_diseases(self) -> List[tuple]:
        """
        Rank diseases by probability (highest to lowest).
        
        Returns:
            List of (disease_name, probability) tuples
        """
        posteriors = self.query_all_diseases()
        return sorted(posteriors.items(), key=lambda x: x[1], reverse=True)
    
    def marginal_symptom_probability(self, symptom_name: str) -> float:
        """
        Calculate P(Symptom) - marginal probability before any evidence.
        This is what you saw as "42%" in Netica.
        
        Args:
            symptom_name: Name of symptom
            
        Returns:
            Marginal probability of symptom
        """
        if symptom_name not in self.symptoms:
            raise ValueError(f"Unknown symptom: {symptom_name}")
        
        # Temporarily clear evidence
        old_evidence = self.evidence.copy()
        self.clear_evidence()
        
        # Enumerate all disease combinations
        combinations = self._enumerate_disease_combinations()
        
        total_prob = 0.0
        
        for disease_states in combinations:
            # Prior probability of this combination
            prior = 1.0
            for disease, is_present in disease_states.items():
                disease_prior = self.diseases[disease]['prior']
                if is_present:
                    prior *= disease_prior
                else:
                    prior *= (1.0 - disease_prior)
            
            # P(Symptom | these diseases) using Noisy-OR
            p_symptom = self._noisy_or(symptom_name, disease_states)
            
            # Accumulate
            total_prob += prior * p_symptom
        
        # Restore evidence
        self.evidence = old_evidence
        
        return total_prob
    
    def likelihood_ratio(self, symptom_name: str, disease_name: str) -> float:
        """
        Calculate likelihood ratio for symptom discriminating disease.
        
        LR = P(Disease | Symptom present) / P(Disease | Symptom absent)
        
        Args:
            symptom_name: Symptom to test
            disease_name: Disease to discriminate
            
        Returns:
            Likelihood ratio (>1 means symptom increases disease probability)
        """
        # With symptom present
        self.set_evidence({symptom_name: True})
        p_with = self.query_disease(disease_name)
        
        # With symptom absent
        self.set_evidence({symptom_name: False})
        p_without = self.query_disease(disease_name)
        
        self.clear_evidence()
        
        if p_without == 0:
            return float('inf')
        
        return p_with / p_without
    
    def explain_reasoning(self, disease_name: str) -> Dict:
        """
        Explain why a disease has its current probability.
        
        Args:
            disease_name: Disease to explain
            
        Returns:
            Dict with prior, likelihood contributions, and posterior
        """
        if not self.evidence:
            return {
                'disease': disease_name,
                'prior': self.diseases[disease_name]['prior'],
                'evidence': 'None',
                'posterior': self.diseases[disease_name]['prior'],
                'explanation': 'No evidence observed - showing prior probability'
            }
        
        prior = self.diseases[disease_name]['prior']
        posterior = self.query_disease(disease_name)
        
        # Find which symptoms support/oppose this disease
        supporting = []
        opposing = []
        
        for symptom_name, observed in self.evidence.items():
            if symptom_name not in self.symptoms:
                continue
            
            # Check if this disease causes this symptom
            causes_it = False
            probability = 0.0
            for cause in self.symptoms[symptom_name]['causes']:
                if cause['disease'] == disease_name:
                    causes_it = True
                    probability = cause['probability']
                    break
            
            if observed and causes_it and probability > 0.5:
                supporting.append(f"{symptom_name} (P={probability:.2f})")
            elif observed and (not causes_it or probability < 0.3):
                opposing.append(f"{symptom_name} (disease rarely causes it)")
            elif not observed and causes_it and probability > 0.7:
                opposing.append(f"No {symptom_name} (disease usually causes it)")
        
        explanation = f"Prior: {prior:.1%} → Posterior: {posterior:.1%}"
        if supporting:
            explanation += f"\nSupporting evidence: {', '.join(supporting)}"
        if opposing:
            explanation += f"\nOpposing evidence: {', '.join(opposing)}"
        
        return {
            'disease': disease_name,
            'prior': prior,
            'posterior': posterior,
            'supporting_evidence': supporting,
            'opposing_evidence': opposing,
            'explanation': explanation
        }
    
    def generate_case(self, diseases_present: List[str]) -> Dict:
        """
        Generate a realistic case by sampling symptoms given diseases.
        Useful for creating practice cases for students.
        
        Args:
            diseases_present: List of disease names that are present
            
        Returns:
            Dict with diseases and probable symptoms
        """
        import random
        
        disease_states = {d: (d in diseases_present) for d in self.diseases.keys()}
        
        symptoms_generated = {}
        
        for symptom_name in self.symptoms.keys():
            # Calculate probability of this symptom
            p_symptom = self._noisy_or(symptom_name, disease_states)
            
            # Sample (with some noise to make realistic)
            is_present = random.random() < p_symptom
            symptoms_generated[symptom_name] = is_present
        
        return {
            'true_diseases': diseases_present,
            'symptoms': {k: v for k, v in symptoms_generated.items() if v},
            'all_symptoms': symptoms_generated
        }


def load_network_from_medgemma_data(medgemma_output: List[Dict]) -> NoisyORBayesNet:
    """
    Convert MedGemma output format to network structure.
    
    Args:
        medgemma_output: List of symptom dicts from MedGemma
        
    Returns:
        Initialized BayesNet
    """
    # Extract disease list (with priors)
    diseases = [
        {'name': 'Asbestosis', 'prior': 0.05},
        {'name': 'Edema', 'prior': 0.10},
        {'name': 'Pneumonia', 'prior': 0.15},
        {'name': 'Hemorrhage', 'prior': 0.02},
        {'name': 'Fibrosis', 'prior': 0.03},
        {'name': 'Infection', 'prior': 0.12},
        {'name': 'LV_Decomp', 'prior': 0.08},
        {'name': 'COPD', 'prior': 0.10},
        {'name': 'PE', 'prior': 0.05}
    ]
    
    # Parse symptoms from MedGemma
    symptoms = []
    
    for symptom_data in medgemma_output:
        symptom = {
            'name': symptom_data['name'],
            'leak': symptom_data['leak'],
            'causes': symptom_data['causes']
        }
        symptoms.append(symptom)
    
    network_data = {
        'diseases': diseases,
        'symptoms': symptoms
    }
    
    return NoisyORBayesNet(network_data)


# Example usage and testing
if __name__ == "__main__":
    # Sample data structure
    network_data = {
        'diseases': [
            {'name': 'Pneumonia', 'prior': 0.15},
            {'name': 'Infection', 'prior': 0.12},
            {'name': 'Asbestosis', 'prior': 0.05}
        ],
        'symptoms': [
            {
                'name': 'Fever',
                'leak': 0.01,
                'causes': [
                    {'disease': 'Pneumonia', 'probability': 0.90},
                    {'disease': 'Infection', 'probability': 0.95}
                ]
            },
            {
                'name': 'Calcified_Plaques',
                'leak': 0.001,
                'causes': [
                    {'disease': 'Asbestosis', 'probability': 0.95}
                ]
            }
        ]
    }
    
    # Create network
    net = NoisyORBayesNet(network_data)
    
    # Test 1: No evidence
    print("=== No Evidence ===")
    print(f"P(Pneumonia) = {net.query_disease('Pneumonia'):.3f}")
    print(f"P(Fever marginal) = {net.marginal_symptom_probability('Fever'):.3f}")
    print()
    
    # Test 2: Observe fever
    print("=== Observe: Fever Present ===")
    net.set_evidence({'Fever': True})
    probs = net.query_all_diseases()
    for disease, prob in sorted(probs.items(), key=lambda x: x[1], reverse=True):
        print(f"P({disease} | Fever) = {prob:.3f}")
    print()
    
    # Test 3: Observe fever + calcified plaques
    print("=== Observe: Fever + Calcified Plaques ===")
    net.set_evidence({'Fever': True, 'Calcified_Plaques': True})
    probs = net.query_all_diseases()
    for disease, prob in sorted(probs.items(), key=lambda x: x[1], reverse=True):
        print(f"P({disease} | Fever, Plaques) = {prob:.3f}")
    print()
    
    # Test 4: Explain reasoning
    print("=== Explanation for Asbestosis ===")
    explanation = net.explain_reasoning('Asbestosis')
    print(explanation['explanation'])
