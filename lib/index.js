// @flow

import type { ThingsType, SlotsType, ThingType, SlotNameType } from './index';

function formatThings(slots: SlotsType<any>, things: ThingsType): Array<ThingType> {
  return things
    .filter((thing) => thing && Array.isArray(thing.slots))
    .map((thing) => Object.assign({}, thing, {
      slots: thing.slots.filter((slotName) => Object.prototype.hasOwnProperty.call(slots, slotName)),
    }))
    .filter((thing) => thing.slots.length > 0);
}

function filterLessImportantThingSlots(things: Array<ThingType>, neededSlot: SlotNameType, startIndex: number): Array<ThingType> {
  function filterThingSlots(filteredThings: Array<ThingType>, thing: ThingType, index: number): Array<ThingType> {
    if (index <= startIndex) {
      return filteredThings;
    }

    return [
      ...filteredThings.slice(0, index),
      Object.assign({}, thing, { slots: thing.slots.filter((slotName) => slotName !== neededSlot) }),
      ...filteredThings.slice(index + 1),
    ];
  }

  return things.reduce(filterThingSlots, things);
}

function ensurePriorityThings(things: Array<ThingType>): Array<ThingType> {
  function filterThingSlots(filteredThings: Array<ThingType>, thing: ThingType, index: number): Array<ThingType> {
    return thing.slots.length === 1
      ? filterLessImportantThingSlots(filteredThings, thing.slots[0], index)
      : filteredThings;
  }

  return things.reduce(filterThingSlots, things);
}

function getChain(things: Array<ThingType>): Array<ThingType> {
  const usedSlots = [];
  let index = 0;

  while (index < things.length) {
    const slot = things[index].slots[0];

    if (usedSlots.indexOf(slot) !== -1) {
      return things.slice(0, index);
    }

    usedSlots.push(slot);
    index += 1;
  }

  return things;
}

function calculateSlots(allThings: Array<ThingType>, numSlots: number) {
  function getSlots(test: Array<ThingType>, offset: number, things: Array<ThingType>, longestChain: Array<ThingType>) {
    function findLongestChainInThings(thingChain: Array<ThingType>, thing: ThingType, thingIndex: number): Array<ThingType> {
      if (thingChain.length >= numSlots) {
        return thingChain;
      }

      const lessImportantThings = things.slice(thingIndex + 1);

      function findLongestChainInSlots(slotChain: Array<ThingType>, slot: SlotNameType): Array<ThingType> {
        if (slotChain.length >= numSlots) {
          return slotChain;
        }

        const nextTest = [
          ...test.slice(0, thingIndex + offset),
          Object.assign({}, thing, { slots: [slot] }),
          ...test.slice(thingIndex + offset + 1),
        ];

        if (lessImportantThings.length > 0) {
          return getSlots(nextTest, offset + 1, lessImportantThings, slotChain);
        }

        const nextChain = getChain(nextTest);
        return nextChain.length > slotChain.length ? nextChain : slotChain;
      }

      return thing.slots.reduce(findLongestChainInSlots, thingChain);
    }

    return things.reduce(findLongestChainInThings, longestChain);
  }

  const seed = allThings.map((thing) => Object.assign({}, thing, { slots: [thing.slots[0]] }));
  return getSlots(seed, 0, allThings, []);
}

export default function findSlots<T>(slots: SlotsType<T> = {}, things: ThingsType = []) {
  const numSlots = Object.keys(slots).length;
  const managedThings = formatThings(slots, things);
  const ensuredThings = [...Array(numSlots)].reduce(ensurePriorityThings, managedThings);
  const filteredThings = calculateSlots(ensuredThings, numSlots);
  return filteredThings.reduce((thingsInSlots, thing) => Object.assign({}, thingsInSlots, { [thing.slots[0]]: thing.name }), slots);
}
