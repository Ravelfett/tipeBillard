import pandas as pd
import matplotlib.pyplot as plt

# Define the file path
file_path = 'out.xls'

# Read the first 1000 rows of the Excel file
df = pd.read_excel(file_path, nrows=1000)

# Extract the x and y positions from the 5th and 6th columns (index 4 and 5 respectively)
x = df.iloc[:, 4]
y = df.iloc[:, 5]

# Filter out points where both x and y are equal to 0
filtered_df = df[(x != 0) | (y != 0)]

# Extract filtered x and y positions
x_filtered = filtered_df.iloc[:, 4]
y_filtered = filtered_df.iloc[:, 5]

# Plot the data
plt.figure(figsize=(10, 6))
plt.plot(x_filtered, y_filtered, marker='o', linestyle='-', markersize=5)  # '-' specifies lines between points
plt.xlabel('X Position')
plt.ylabel('Y Position')
plt.title('Plot of X and Y Positions (First 1000 points, filtered)')
plt.grid(True)

# Show the plot
plt.show()

