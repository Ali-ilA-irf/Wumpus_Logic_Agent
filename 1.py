# ── TASK 1 HELPERS ────────────────────────────────────────────
def load_and_prepare(binary=True):
    import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix


# ── TASK 1 HELPERS ────────────────────────────────────────────
def load_and_prepare(binary=True):
 """
    Roll: <YOUR_ROLL_NUMBER>
    Load Iris, return (X_train, X_test, y_train, y_test).
    If binary=True use only classes 0 and 1 (first 100 rows).
    Apply StandardScaler. Split 80/20 with random_state=42.
    """
    # TODO
    pass


def plot_data(X, y, title="Iris – Petal Features"):
    """
    Roll: <YOUR_ROLL_NUMBER>
    Scatter plot of petal_length vs petal_width, coloured by class.
    """
    # TODO
    pass
