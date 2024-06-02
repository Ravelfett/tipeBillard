import pandas as pd
from PIL import Image
import matplotlib.pyplot as plt

# Load the Excel file
xls_file_path = '4kvid.xls'  # Replace with the path to your XLS file
df = pd.read_excel(xls_file_path)

# Extract the x and y coordinates
x = df.iloc[304:408:4, 3]  # 3rd column (index 2)
y = df.iloc[304:408:4, 2]  # 2nd column (index 1)

# Load the image
image_path = 'out.png'  # Replace with the path to your image
image = Image.open(image_path)

# Adjust the y coordinates to account for the origin being at the bottom-left
image_height = image.height
y = image_height - y

# Plot the image
plt.figure(figsize=(10, 10))
plt.imshow(image)
plt.scatter(x, y, marker='o', color='red', s=4)  # Trace the line with red color and markers for each point
plt.axis('off')  # Hide axes
plt.show()
