# Crowd evacuation simulation
This repository contains the implementation of related [article](/article/out/crowd_evacuation_article.pdf) that was written as a part
of *Crowd behaviour* course at the *Faculty of Computer and Information Science at the 
University of Ljubljana*.

## Description
Each year a lot of terrorist attacks happen all over the world where a lot of people are
killed or heavily damaged. With hope to decrease the casualties of such attacks, we present
a crowd evacuation simulation that uses fuzzy logic to simulate the movement of people
and assailants in different rooms.

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

## Running locally
To run the visualization locally you just have to clone the repo
```bash
clone https://github.com/Blarc/crowd-evacuation.git
```
and open `index.html` in your favourite browser **or** run it on a local server:
```bash
cd fri-staff-visualization

# for python3
python -m http.server
```
For different ways of setting up a local server you can check out [link](https://github.com/processing/p5.js/wiki/Local-server).

## Live demo
Live demo can be seen [here](https://blarc.github.io/crowd-evacuation/).

## Acknowledgments
External libraries have been used for the visualization:
- **p5.js**: for drawing everything to the screen ([link](https://github.com/processing/p5.js/))
- **quadtree.js**: optimisation for calculating interactions between objects ([link](https://github.com/CodingTrain/QuadTree))
