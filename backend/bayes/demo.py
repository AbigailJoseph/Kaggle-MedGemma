"""
Simple demonstration of Noisy-OR Bayesian Network
Shows how probabilities change as you observe symptoms
"""

from noisy_or_bayesnet import NoisyORBayesNet
from network_data import PULMONARY_NETWORK_DATA, DISEASE_DISPLAY_NAMES, SYMPTOM_DISPLAY_NAMES


def show_probabilities(net, title, observed_symptoms=None):
    """Display current disease and symptom probabilities"""
    print(f"\n{title}")
    print("=" * 60)
    
    # Show disease probabilities
    print("\nDISEASE PROBABILITIES:")
    print("-" * 60)
    probs = net.query_all_diseases()
    for disease, prob in sorted(probs.items(), key=lambda x: x[1], reverse=True):
        display_name = DISEASE_DISPLAY_NAMES[disease]
        print(f"  {display_name:45} {prob:6.1%}")
    
    # Show symptom probabilities (marginal - before observing them)
    print("\nSYMPTOM PROBABILITIES:")
    print("-" * 60)
    
    # Calculate marginal for key symptoms
    key_symptoms = [
        'Progressive_Dyspnea', 'Crackles', 'Hypoxemia', 'Tachypnea',
        'Fever', 'Chest_Pain', 'Hemoptysis', 'Elevated_JVP',
        'Bilateral_Opacities', 'RV_Dysfunction', 'Calcified_Plaques',
        'Pulm_Hypertension', 'Altered_Mental_Status'
    ]
    
    for symptom_name in key_symptoms:
        if symptom_name in net.symptoms:
            # Check if this symptom was observed
            if observed_symptoms and symptom_name in observed_symptoms:
                observed_value = observed_symptoms[symptom_name]
                if observed_value:
                    status = "[OBSERVED: Present]"
                else:
                    status = "[OBSERVED: Absent]"
                # For observed symptoms, probability is 100% or 0%
                prob = 1.0 if observed_value else 0.0
            else:
                # For unobserved symptoms, calculate marginal probability
                prob = net.marginal_symptom_probability(symptom_name)
                status = ""
            
            display_name = SYMPTOM_DISPLAY_NAMES[symptom_name]
            print(f"  {display_name:45} {prob:6.1%}  {status}")
    
    print()


if __name__ == "__main__":
    # Create network
    net = NoisyORBayesNet(PULMONARY_NETWORK_DATA)
    
    print("\n" + "=" * 60)
    print("BAYESIAN NETWORK - PROBABILITY UPDATES")
    print("=" * 60)
    
    # 1. No evidence
    show_probabilities(net, "BASELINE (No symptoms observed)", {})
    
    # 2. Observe fever
    evidence = {'Fever': True}
    net.set_evidence(evidence)
    show_probabilities(net, "AFTER OBSERVING: Fever", evidence)
    
    # 3. Observe fever + crackles
    evidence = {'Fever': True, 'Crackles': True}
    net.set_evidence(evidence)
    show_probabilities(net, "AFTER OBSERVING: Fever + Crackles", evidence)
    
    # 4. Observe fever + crackles + dyspnea
    evidence = {
        'Fever': True,
        'Crackles': True,
        'Progressive_Dyspnea': True
    }
    net.set_evidence(evidence)
    show_probabilities(net, "AFTER OBSERVING: Fever + Crackles + Dyspnea", evidence)
    
    # 5. Add calcified plaques (changes everything!)
    evidence = {
        'Fever': True,
        'Crackles': True,
        'Progressive_Dyspnea': True,
        'Calcified_Plaques': True
    }
    net.set_evidence(evidence)
    show_probabilities(net, "AFTER OBSERVING: + Calcified Pleural Plaques", evidence)
    
    print("=" * 60)
    print("DONE")
    print("=" * 60)
