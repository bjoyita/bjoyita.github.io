"""I demonstrate PCA on synthetic pixel images. Run: python pixel-pca.py
Dependencies: numpy, matplotlib. Brightness values are dimensionless.
"""

# Step 1: I create one small image.
import numpy as np
import matplotlib.pyplot as plt

# I store the brightness values as rows of pixels.
image = np.array([
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
])
print("Image shape:", image.shape)
print("Pixel at row 0, column 2:", image[0, 2])
plt.imshow(image, cmap="gray", vmin=0, vmax=1, interpolation="nearest")
plt.xlabel("Column index")
plt.ylabel("Row index")
plt.colorbar(label="Brightness (dimensionless)")
plt.show()
assert image.shape == (4, 4)
assert image[0, 2] == 1.0

# Step 2: I create a collection of images.
size = 6
sample_count = 24
left_right = np.ones((size, size))
# I change the first three columns to make a left/right contrast.
left_right[:, :3] = -1

top_bottom = np.ones((size, size))
top_bottom[:3, :] = -1

# I build the collection one image at a time.
images = []
for sample in range(sample_count):
    angle = 2 * np.pi * sample / sample_count
    a = 0.28 * np.cos(angle)
    b = 0.10 * np.sin(angle)
    new_image = 0.5 + a * left_right + b * top_bottom
    images.append(new_image)

images = np.array(images)
print("Collection shape:", images.shape)
assert images.shape == (24, 6, 6)
assert images.min() >= 0 and images.max() <= 1

# Step 3: I put each image in one data row.
# I keep all pixel values and arrange each image in one row.
X = images.reshape(sample_count, size * size)
print("Data matrix shape:", X.shape)
restored = X[0].reshape(size, size)
assert X.shape == (24, 36)
assert np.array_equal(restored, images[0])

# Step 4: I subtract the mean image.
# I calculate one mean for each pixel position.
mean_row = X.mean(axis=0)
X_centered = X - mean_row
mean_image = mean_row.reshape(size, size)
print("Mean brightness:", mean_image.mean())
assert np.allclose(mean_image, 0.5)
assert np.allclose(X_centered.mean(axis=0), 0.0)

# Step 5: I find the principal components.
U, singular_values, Vt = np.linalg.svd(X_centered, full_matrices=False)
components = Vt
# I project each centered image onto the component directions.
scores = X_centered @ components.T

# I calculate the sample variance along each principal direction.
variances = singular_values**2 / (sample_count - 1)
variance_fraction = variances / variances.sum()
print("First two variance fractions:", variance_fraction[:2])
assert np.allclose(variance_fraction[:2], [0.28**2, 0.10**2] / np.array(0.28**2 + 0.10**2))
assert np.allclose(variance_fraction[:2].sum(), 1.0)
assert np.allclose(components @ components.T, np.eye(sample_count))

# Step 6: I reconstruct an image.
sample = 3
k = 1
# I add the retained patterns to the mean image.
reconstructed_row = mean_row + scores[sample, :k] @ components[:k]
reconstructed = reconstructed_row.reshape(size, size)
residual = images[sample] - reconstructed
rmse = np.sqrt(np.mean(residual**2))
print("Brightness RMSE:", rmse)

fig, axes = plt.subplots(1, 3, figsize=(10, 3))
axes[0].imshow(images[sample], cmap="gray", vmin=0, vmax=1)
axes[1].imshow(reconstructed, cmap="gray", vmin=0, vmax=1)
axes[2].imshow(residual, cmap="RdBu_r", vmin=-0.4, vmax=0.4)
for ax, title in zip(axes, ["Original", "Reconstruction", "Residual"]):
    ax.set_title(title)
    ax.set_xlabel("Column index")
    ax.set_ylabel("Row index")
plt.tight_layout()
plt.show()

# I check that both constructed patterns recover the complete collection.
full_reconstruction = mean_row + scores[:, :2] @ components[:2]
assert np.allclose(full_reconstruction, X)
assert np.isclose(rmse, 0.10 / np.sqrt(2))
print("All tutorial checks passed.")
