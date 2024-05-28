import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load the Excel file
file_path = '4kvid.xls'
df = pd.read_excel(file_path)

# Assume that the columns for x and y positions are the 5th and 6th columns (index 4 and 5)
time_col = df.columns[0]  # assuming the first column is time
x_col = df.columns[4]
y_col = df.columns[5]

# Filter out rows where both x and y positions are (0, 0)
df = df[(df[x_col] != 0) | (df[y_col] != 0)]


def cut(df, start, end):
    return df[(df[time_col] >= start) & (df[time_col] <= end)]

#print(df)

segments = []

# for each jump in index of the rows of df, cut the df and append the segment to the list
last = 0
for i in range(1, len(df)):
    if df[time_col].iloc[i] - df[time_col].iloc[i - 1] > 1:
        segments.append(cut(df, df[time_col].iloc[last], df[time_col].iloc[i - 1]))
        last = i
segments.append(cut(df, df[time_col].iloc[last], df[time_col].iloc[len(df) - 1]))


print(segments[0])


# Calculate speed from position and time
def calculate_speed(segment):
    times = segment[time_col].values
    x_positions = segment[x_col].values
    y_positions = segment[y_col].values
    
    time_diffs = np.diff(times)
    x_diffs = np.diff(x_positions)
    y_diffs = np.diff(y_positions)
    
    speeds = np.sqrt(x_diffs**2 + y_diffs**2) / time_diffs
    return times[1:], speeds

#reset the time of each segment to make it start at 0
for segment in segments:
    segment[time_col] = segment[time_col] - segment[time_col].iloc[0]


# Plot all segments

step = 2;

plt.figure()
for segment in segments:
    times, speeds = calculate_speed(segment)
    plt.plot(times[::step], speeds[::step])


#Code to separate the different periods with a semi transparent red dashed line
plt.axvline(x=9.5, color='r', linestyle='--', alpha=0.3)
plt.axvline(x=16, color='r', linestyle='--', alpha=0.3)


# Calculate positions for the labels
y_max = max(max(calculate_speed(segment)[1]) for segment in segments)

# Code to label the different periods
fsize = 10
plt.text(2, y_max, 'roulement', fontsize=fsize, color='black')
plt.text(9.5, y_max, 'glissement', fontsize=fsize, color='black')
plt.text(19, y_max, 'roulement apres collision', fontsize=fsize, color='black')

plt.xlabel('Temps')
plt.ylabel('Vitesse')
plt.title('Vitesse en fonction du temps pour differents lancés')
plt.show()

