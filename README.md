# Crowd evacuation simulation
This repository contains the implementation of related [article](/article/out/crowd_evacuation_article.pdf) that was written as a part
of *Crowd behaviour* course at the *Faculty of Computer and Information Science at the 
University of Ljubljana*.

## Description
Each year a lot of terrorist attacks happen all over the world where a lot of people are
killed or heavily damaged. With hope to decrease the casualties of such attacks, we present
a crowd evacuation simulation that uses fuzzy logic to simulate the movement of people
and assailants in different rooms.

First we prepare models for achieving specific goals: obstacle avoidance, path
searching and goal seeking. We then integrate these models together by setting a weight
for each of the models, which determines how much each of the models affects the object's
movement. We test the algorithm by simulating evacuation in different rooms that we
prepared in advance. For better understanding of the simulation and creation of
different rooms, user interface is implemented.

The article and implementation is based on existing article: *Zhou, Min & Dong, Hairong & Wen,
Ding & Yao, Xiuming & Sun, Xubin. (2016). Modeling of Crowd Evacuation With Assailants via a
Fuzzy Logic Approach. IEEE Transactions on Intelligent Transportation Systems*, which can be
found [here](https://ieeexplore.ieee.org/document/7442132).

## Repository structure
The repository contains the following folders:
- `article` contains the latex files and the article in pdf
- `maps` contains saved simulation rooms
- `results` contains different simulations' results
- `src` contains the code

## Live demo
Live demo is deployed via GitHub pages and is available [here](https://blarc.github.io/crowd-evacuation/).

## Running locally
To run the visualization locally you just have to clone the repo
```bash
clone https://github.com/Blarc/crowd-evacuation.git
```
and open `index.html` in your favourite browser **or** run it on a local server:
```bash
cd crowd-evacuation
# for python3
python -m http.server
```
For different ways of setting up a local server you can check out [link](https://github.com/processing/p5.js/wiki/Local-server).

## User interface
For creating rooms and running simulations you either have to upload a saved configuration or
create your own. Some saved configurations are saved in folder `maps`. If you would like to
create and run your own simulations, you can do so with different mouse modes, that can be
enabled via keyboard:

### Drawing
- **D** - enables drawing obstacles mode
- **P** - enables drawing pedestrians mode
- **A** - enables drawing assailant mode
- **I** - enables drawing pedestrians with custom goal mode (first click creates pedestrian, second click creates goal)
- **E** - enables erasing mode
- **C** - clears all created obstacles, pedestrians and assailants
- **Size** - change the obstacle's size when drawing

### Visual aids
- **V** - hide / show pedestrian arcs
- **K** - hide / show assailnt arcs

### Simulation manipulation
- **SPACE** - pause / resume simulation
- **U** - remove all global and local goals
- **R** - reset simulation (clears and resets the simulation, if preloaded configuration exists)
- **Width / Height** - changes the size of the room

### Saving / downloading
- **S** - download current configuration of the simulation (created obstacles, pedestrians and assailants)
- **Choose file** - upload saved simulation configuration
- **Run simulations** - automatically resets simulation when there is no pedestrians left in the room and saves statistics each second
- **T** - download simulation statistics

## Acknowledgments
External libraries have been used for the visualization:
- **p5.js**: for drawing everything to the screen ([link](https://github.com/processing/p5.js/))
- **quadtree.js**: optimisation for calculating interactions between objects ([link](https://github.com/CodingTrain/QuadTree))
