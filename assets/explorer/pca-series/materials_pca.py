# We examine the synthetic dataset in small steps.
# Run: python materials_pca.py with the CSV in the same directory.
# Dependency: NumPy.

import numpy as np

# We read the five measurements, leaving out the specimen label.
data = np.loadtxt("materials-pca-synthetic.csv",
                  delimiter=",", skiprows=1, usecols=(1, 2, 3, 4, 5))
print(data.shape)
print(data[:3])
assert data.shape == (300, 5)
assert np.isfinite(data).all()

# We calculate each mean and sample standard deviation across specimens.
means = data.mean(axis=0)
standard_deviations = data.std(axis=0, ddof=1)
assert (standard_deviations > 0).all()
scaled = (data - means) / standard_deviations
print(scaled.mean(axis=0))
print(scaled.var(axis=0, ddof=1))

# We form the covariance matrix of the five standardized features.
covariance = scaled.T @ scaled / (len(scaled) - 1)
values, directions = np.linalg.eigh(covariance)

# We place the largest eigenvalue and its direction first.
order = np.argsort(values)[::-1]
values = values[order]
directions = directions[:, order]

# We choose a sign that makes the yield-strength coefficient positive.
if directions[1, 0] < 0:
    directions[:, 0] *= -1

fractions = values / values.sum()
scores = scaled @ directions
print(100 * fractions)
print(directions[:, 0])

# We reconstruct all five standardized measurements using two components.
kept = 2
reconstructed_scaled = scores[:, :kept] @ directions[:, :kept].T
reconstructed = reconstructed_scaled * standard_deviations + means
print("Variance retained (%):", 100 * fractions[:kept].sum())
print("RMS error in standardized values:",
      np.sqrt(np.mean((scaled - reconstructed_scaled)**2)))

# We check that using all five components recovers the input.
full = scores @ directions.T
assert np.allclose(full, scaled)
