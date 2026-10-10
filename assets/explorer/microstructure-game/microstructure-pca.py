"""I generate colored pixel patterns and reconstruct their one-hot rows with PCA.
Run: python microstructure-pca.py
Dependencies: numpy, matplotlib. All quantities are dimensionless.
"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap

# Step 1: I choose the display colors. White is included for every palette size.
PALETTE = ['#8b5cf6', '#4f46e5', '#3b82f6', '#22c55e',
           '#facc15', '#fb923c', '#ef4444', '#ffffff']

# Step 2: I generate reproducible random numbers with the same rule as the browser.
def random_numbers(seed):
    state = int(seed) & 0xffffffff
    while True:
        state = (1664525 * state + 1013904223) & 0xffffffff
        yield state / 4294967296


def make_pattern(size, colors, kind, width, seed):
    random = random_numbers(seed)
    labels = np.zeros((size, size), dtype=int)
    offset = int(next(random) * colors)
    centers = []
    if kind == 'clustered':
        count = max(colors, int(np.floor(size * size / (width * width) + 0.5)))
        for i in range(count):
            centers.append((next(random) * size, next(random) * size, i % colors))
    for row in range(size):
        for column in range(size):
            label = offset
            if kind == 'random':
                label = int(next(random) * colors)
            elif kind == 'horizontal':
                label = (row // width + offset) % colors
            elif kind == 'vertical':
                label = (column // width + offset) % colors
            elif kind == 'diagonal':
                label = ((row + column) // width + offset) % colors
            elif kind == 'checkerboard':
                label = 0 if (row // width + column // width) % 2 == 0 else colors - 1
            elif kind == 'clustered':
                nearest = float('inf')
                for center_row, center_column, color in centers:
                    distance = (row - center_row)**2 + (column - center_column)**2
                    if distance < nearest:
                        nearest = distance
                        label = color
            labels[row, column] = label
    return labels


# Step 3: I encode each color as a separate feature, then center the image rows.
def encode_rows(labels, colors):
    size = labels.shape[0]
    return np.eye(colors)[labels].reshape(size, size * colors)


# Step 4: I use NumPy SVD to calculate the principal directions of the centered rows.
def analyze_pattern(labels, colors):
    X = encode_rows(labels, colors)
    mean_row = X.mean(axis=0)
    centered = X - mean_row
    U, strengths, Vt = np.linalg.svd(centered, full_matrices=False)
    scores = centered @ Vt.T
    total_variation = np.sum(strengths**2)
    states = []
    size = len(labels)
    for count in range(size):
        rebuilt = mean_row + scores[:, :count] @ Vt[:count]
        weights = rebuilt.reshape(size, size, colors)
        recovered = weights.argmax(axis=2)
        rmse = np.sqrt(np.mean((X - rebuilt)**2))
        correct = int(np.sum(recovered == labels))
        fraction = None if total_variation < 1e-12 else np.sum(strengths[:count]**2) / total_variation
        states.append({'count': count, 'rmse': float(rmse), 'correct': correct,
                       'fraction': fraction, 'labels': recovered, 'weights': weights})
    return {'labels': labels, 'states': states,
            'exact': next(s['count'] for s in states if s['rmse'] < 1e-8),
            'phase': next(s['count'] for s in states if s['correct'] == size * size)}


# Step 5: I choose a case, inspect the error and compare the original and reconstruction.
def run_example():
    size = 16
    colors = 8
    kind = 'clustered'
    width = 3
    seed = 110
    labels = make_pattern(size, colors, kind, width, seed)
    result = analyze_pattern(labels, colors)
    for state in result['states']:
        print(f"Components: {state['count']:2d}, RMSE: {state['rmse']:.6f}, "
              f"correct colors: {state['correct']}/{size * size}")
    print('Minimum for numerical reconstruction:', result['exact'])
    print('Minimum for pixel colors with this NumPy basis:', result['phase'])
    retained = 4
    colormap = ListedColormap(PALETTE[:colors - 1] + [PALETTE[-1]])
    fig, axes = plt.subplots(1, 2, figsize=(8, 4))
    axes[0].imshow(labels, cmap=colormap, vmin=0, vmax=colors - 1, interpolation='nearest')
    axes[1].imshow(result['states'][retained]['labels'], cmap=colormap,
                   vmin=0, vmax=colors - 1, interpolation='nearest')
    axes[0].set_title('Original pattern')
    axes[1].set_title(f'{retained}-component reconstruction')
    for ax in axes:
        ax.set_xlabel('Column index')
        ax.set_ylabel('Row index')
    plt.tight_layout()
    plt.show()
    return result


# Step 6: I check known cases and numerical recovery before changing the example.
def check_examples():
    for kind in ['uniform', 'vertical', 'horizontal', 'checkerboard', 'diagonal', 'clustered', 'random']:
        result = analyze_pattern(make_pattern(12, 8, kind, 2, 42), 8)
        errors = [state['rmse'] for state in result['states']]
        assert errors[-1] < 1e-8
        assert all(b <= a + 1e-12 for a, b in zip(errors, errors[1:]))
        if kind in ['uniform', 'vertical']:
            assert result['exact'] == 0
        if kind == 'checkerboard':
            assert result['exact'] == 1
    print('All pattern checks passed.')


if __name__ == '__main__':
    run_example()
    check_examples()
