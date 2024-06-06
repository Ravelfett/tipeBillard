import pandas as pd
from PIL import Image
import matplotlib.pyplot as plt

# Load the Excel file
xls_file_path = 'out4.xls'  # Replace with the path to your XLS file
df = pd.read_excel(xls_file_path)

# Extract the x and y coordinates
x = df.iloc[673:702:1, 3]  # 3rd column (index 2)
y = df.iloc[673:702:1, 2]  # 2nd column (index 1)

# Load the image
image_path = 'frame650.jpg'  # Replace with the path to your image
image = Image.open(image_path)

# Adjust the y coordinates to account for the origin being at the bottom-left
image_height = image.height
image_width = image.width
x = image_width - x
y = image_height - y

# Plot the image
plt.figure(figsize=(10, 10))
plt.imshow(image)
plt.scatter(x, y, marker='o', color='red', s=4)  # Trace the line with red color and markers for each point
plt.axis('off')  # Hide axes
plt.show()
