[![Build Status](https://travis-ci.org/tomruttle/slot-finder.svg?branch=master)](https://travis-ci.org/tomruttle/slot-finder)

# slot-finder

Script for putting things in slots

The slot-finding algorithm will try to place as many things into slots as it can without clashing (priority dictated by the order of the `things` array), and will try to put the things into their preferred slots (as dictated by the order of the `slots` array).

Any unfilled slots will retain the value you pass in.

## API

```typescript
type SlotNameType = string;
type ThingNameType = string;

type SlotsType = { [slot: SlotNameType]: any };

type ThingType = {
  name: ThingNameType,
  slots: Array<SlotNameType>,
};

type ThingsType = Array<ThingType>;

export default (slots: SlotsType, things: ThingsType) => { [slot: SlotNameType]: ThingNameType };
```

## Example

```javascript
import slotFinder from 'slot-finder';

const slots = { left: null, right: null, center: null };

const things = [
  { name: 'first', slots: ['right'] },
  { name: 'second', slots: ['left', 'right'] },
];

const thingsInSlots = slotFinder(slots, things);

console.log(thingsInSlots);
// -> { left: 'second', right: 'first', center: null }
```
