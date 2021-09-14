"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  star: false,
  winner: false,
};

const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  registerButtons();
  loadJSON();
}

function registerButtons() {
  document.querySelectorAll(`[data-action="filter"]`).forEach((btn) => {
    btn.addEventListener("click", filterAnimals);
  });
  document.querySelectorAll(`[data-action="sort"]`).forEach((btn) => {
    btn.addEventListener("click", sortAnimals);
  });
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  // console.log(jsonData);
  allAnimals = jsonData.map(preapareObject);
  // displayList(allAnimals);
  buildList();
}

function preapareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;
  animal.star = false;

  return animal;
}

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document
    .querySelector("template#animal")
    .content.cloneNode(true);

  // star
  if (animal.star) {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  clone.querySelector("[data-field=star]").addEventListener("click", setStar);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  // winner
  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
  clone
    .querySelector("[data-field=winner]")
    .addEventListener("click", setWinner);

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

// function called on click (filter)
function filterAnimals() {
  // prepareFilteredList(this.dataset.filter);
  setFilter(this.dataset.filter);
}

function setFilter(filter) {
  settings.filter = filter;
  buildList();
}

function buildList() {
  const currentList = prepareFilteredList(allAnimals);
  const sortedList = prepareSortedList(currentList);
  displayList(sortedList);
}

// prepare filtered list of animals for displaying
function prepareFilteredList(animalsList) {
  let filteredList = animalsList;
  if (settings.filter !== "all") {
    filteredList = allAnimals.filter(
      (animal) => animal.type === settings.filter
    );
  }

  return filteredList;
}

function prepareSortedList(sortedList) {
  // let sorted = allAnimals;

  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByCriteria);

  function sortByCriteria(animalA, animalB) {
    if (animalA[settings.sortBy] < animalB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

// sort
function sortAnimals(e) {
  const sortBy = e.target.dataset.sort;
  const sortDir = e.target.dataset.sortDirection;

  // find old sortBy element and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}'`);
  oldElement.classList.remove("sortby");

  // indicate active sort
  e.target.classList.add("sortby");

  if (sortDir === "asc") {
    e.target.dataset.sortDirection = "desc";
  } else {
    e.target.dataset.sortDirection = "asc";
  }
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function setStar() {
  const animalName =
    this.parentNode.querySelector(`[data-field="name"]`).textContent;
  const animal = allAnimals.find((item) => item.name === animalName);
  animal.star = !animal.star;
  buildList();
}

function setWinner() {
  const animalName =
    this.parentNode.querySelector(`[data-field="name"]`).textContent;
  const animal = allAnimals.find((item) => item.name === animalName);
  if (animal.winner) {
    animal.winner = !animal.winner;
  } else {
    tryToMakeAWinner(animal);
  }
  buildList();
}

function tryToMakeAWinner(selectedAnimal) {
  const winners = allAnimals.filter((animal) => animal.winner);
  const numberOfWinners = winners.length;
  const other = winners
    .filter((animal) => animal.type === selectedAnimal.type)
    .shift();

  // if there is another of the same type
  if (other !== undefined) {
    console.log("There can only be one winner of each type!");
    removeOther(other);
  } else if (numberOfWinners >= 2) {
    console.log("There can only be two winners!");
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedAnimal);
  }

  function removeOther(other) {
    // show name on button
    document.querySelector("#onlyonekind .animal1").textContent = other.name;

    // ask user to ignore or remove the other
    document.querySelector("#onlyonekind").classList.add("show");
    document
      .querySelector("#onlyonekind .closebutton")
      .addEventListener("click", closeDialog);
    document
      .querySelector("#removeother")
      .addEventListener("click", clickRemoveOther);

    // if ignore - do nothing
    function closeDialog() {
      document.querySelector("#onlyonekind").classList.remove("show");
      document
        .querySelector("#removeother")
        .removeEventListener("click", clickRemoveOther);
      document
        .querySelector("#onlyonekind .closebutton")
        .removeEventListener("click", closeDialog);
    }

    // if remove other - :
    function clickRemoveOther() {
      removeWinner(other);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeAorB(winnerA, winnerB) {
    // show names on buttons
    document.querySelector("#onlytwowinners .animal1").textContent =
      winnerA.name;
    document.querySelector("#onlytwowinners .animal2").textContent =
      winnerB.name;

    // ask user to ignore or remove A or B
    document.querySelector("#onlytwowinners").classList.add("show");
    document
      .querySelector("#onlytwowinners .closebutton")
      .addEventListener("click", closeDialog);
    document
      .querySelector("#onlytwowinners #removea")
      .addEventListener("click", clickRemoveA);
    document
      .querySelector("#onlytwowinners #removeb")
      .addEventListener("click", clickRemoveB);

    // if ignore - do nothing
    function closeDialog() {
      document.querySelector("#onlytwowinners").classList.remove("show");
      document
        .querySelector("#onlytwowinners #removea")
        .removeEventListener("click", clickRemoveA);
      document
        .querySelector("#onlytwowinners #removeb")
        .removeEventListener("click", clickRemoveB);
      document
        .querySelector("#onlytwowinners .closebutton")
        .removeEventListener("click", closeDialog);
    }

    // if removeA:
    function clickRemoveA() {
      removeWinner(winnerA);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }

    // else if removeB:
    function clickRemoveB() {
      removeWinner(winnerB);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  function makeWinner(animal) {
    animal.winner = true;
  }
}
