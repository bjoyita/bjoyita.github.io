"""I rebuild a small picture using SVD. Run: python svd-picture.py
Dependencies: numpy, matplotlib. Brightness is dimensionless, from 0 to 1.
"""
import numpy as np
import matplotlib.pyplot as plt

# I draw an eight-row, eight-column picture of a house.
image = np.full((8, 8), 0.10)
image[1, 3:5] = 0.75
image[2, 2:6] = 0.75
image[3, 1:7] = 0.75
image[4:7, 2:6] = 0.50
image[4, 2] = image[4, 5] = 0.80
image[5:7, 3:5] = 0.20

# I calculate the row patterns, strengths and column patterns.
U, strengths, Vt = np.linalg.svd(image, full_matrices=False)

# I add one numerical layer at a time. I do not clip the calculation.
reconstructions = []
for count in range(5):
    rebuilt = (U[:, :count] * strengths[:count]) @ Vt[:count]
    reconstructions.append(rebuilt)
    rmse = np.sqrt(np.mean((image - rebuilt)**2))
    print(f"Layers: {count}, brightness RMSE: {rmse:.6f}")

assert np.allclose(reconstructions[4], image)
errors = [np.mean((image - rebuilt)**2) for rebuilt in reconstructions]
assert all(errors[i + 1] <= errors[i] for i in range(4))

# I use the same brightness scale for every displayed picture.
fig, axes = plt.subplots(1, 5, figsize=(12, 3))
for count, ax in enumerate(axes):
    ax.imshow(reconstructions[count], cmap="gray", vmin=0, vmax=1,
              interpolation="nearest")
    ax.set_title(f"{count} layers")
    ax.set_xticks([])
    ax.set_yticks([])
plt.tight_layout()
plt.show()
print("All picture checks passed.")
