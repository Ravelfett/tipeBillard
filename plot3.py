import numpy as np
import matplotlib.pyplot as plt

# Parameters
initial_v = 1  # Initial velocity
time_step = 0.1  # Time step for the simulation
total_time = 25  # Total time for the simulation
f_values = [0.1, 0.2, 0.5, 1.0]  # Different f values to test

# Time array
time = np.arange(0, total_time, time_step)

# Function to calculate velocity over time for a given f
def simulate_velocity(f, initial_v, time_step, total_time):
    v = initial_v
    velocities = []

    for t in time:
        a = v * -f
        v = v + a * time_step
        velocities.append(v)

    return velocities

# Plotting
plt.figure(figsize=(10, 6))

for f in f_values:
    velocities = simulate_velocity(f, initial_v, time_step, total_time)
    plt.plot(time, velocities, label=f'mu = {f}')

plt.title('Vitesse en fonction du temps pour différentes valeurs de mu')
plt.xlabel('Temps')
plt.ylabel('Vitesse')
plt.legend()
plt.grid(True)
plt.show()

