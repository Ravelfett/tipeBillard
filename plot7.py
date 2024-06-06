import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load the Excel file
file_path = 'out4.xls'
df = pd.read_excel(file_path)

# Assume that the columns for x and y positions are the 5th and 6th columns (index 4 and 5)
time_col = df.columns[0]  # assuming the first column is time
x_col = df.columns[4]
y_col = df.columns[5]

df[time_col] = df[time_col] / 60  # convert time to seconds

# Filter out rows where both x and y positions are (0, 0)
df = df[(df[x_col] != 0) | (df[y_col] != 0)]

def cut(df, start, end):
    return df[(df[time_col] >= start) & (df[time_col] <= end)]

segments = []

# for each jump in index of the rows of df, cut the df and append the segment to the list
last = 0
for i in range(1, len(df)):
    if df[time_col].iloc[i] - df[time_col].iloc[i - 1] > 1:
        segments.append(cut(df, df[time_col].iloc[last], df[time_col].iloc[i - 1]))
        last = i
segments.append(cut(df, df[time_col].iloc[last], df[time_col].iloc[len(df) - 1]))


def calculate_x_velocity(segment):
    times = segment[time_col].values
    x_positions = segment[x_col].values

    time_diffs = np.diff(times)
    x_diffs = np.diff(x_positions)

    x_velocities = abs(x_diffs / time_diffs)
    return times[1:], x_velocities

def calculate_y_velocity(segment):
    times = segment[time_col].values
    y_positions = segment[y_col].values

    time_diffs = np.diff(times)
    y_diffs = np.diff(y_positions)

    y_velocities = abs(y_diffs / time_diffs)
    return times[1:], y_velocities

# Reset the time of each segment to make it start at 0
for segment in segments:
    segment[time_col] = segment[time_col] - segment[time_col].iloc[0]

plt.figure(figsize=(12, 6))

step = 2

# Plotting x velocities
plt.subplot(1, 2, 1)
for segment in segments:
    plt.plot(segment[time_col], segment[x_col], label='Segment data')
plt.xlabel('Temps (s)')
plt.ylabel('Position X (cm/s)')
plt.title('Position X en fonction du temps')
plt.legend()

# Plotting y velocities
plt.subplot(1, 2, 2)
for segment in segments:
    plt.plot(segment[time_col], segment[y_col], label='Segment data')
plt.xlabel('Temps (s)')
plt.ylabel('Position Y (cm/s)')
plt.title('Position Y en fonction du temps')
plt.legend()

plt.tight_layout()
plt.show()

