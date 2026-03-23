# Interactive To-Do List

A small program I built using HTML, CSS, and JavaScript to develop my knowledge of `localstorage` and data filtering

## What it does

- **Add, edit, delete tasks** - Click the title to edit inline (press Enter or Esc)
- **Priorities** - Click the colored badge to cycle between High, Medium, Low
- **Due dates** - Set optional due dates when creating tasks
- **Smart filters** - Toggle between All / Active / Completed, or use the "More" dropdown for Overdue / Today / Upcoming
- **Remembers everything** - Uses `localStorage` so your tasks stick around after you close the browser
- **Hopefully works on phone** - Responsive design that doesn't break on smaller screens
- **Nice details** - Empty messages change based on what filter you're using, task counters update live, and the last task you clicked stays highlighted

## How to use it

Just open `index.html` in your browser. That's it.

Or if you want to edit the code:
- Type a task and pick a priority + due date, then click Add
- Click any task title to edit it inline
- Click the priority badge to cycle through priorities
- Check the checkbox to mark it done
- Click delete to remove it
- Try the different filters to see different views

## What I learned building this

**DOM stuff**: Figured out event delegation (one listener for whole list), `.closest()` for finding parent elements, and how to replace nodes with `.replaceWith()` for inline editing.

**State management**: Realized keeping one source of truth (the `tasks` array) makes everything easier. Every change goes: update array → save to `localStorage` → re-render the UI. So I never update the DOM directly without updating the data first.

**localStorage**: Storing/retrieving JSON strings, handling corrupted data gracefully (try/catch), and persisting UI state like which task was last clicked.

**Sorting & filtering**: Built functions like `prioritySorting()` to sort by priority, and `getFilteredTasks()` to handle multiple filter types. Dates were tricky - had to figure out `toISOString()` for storage and comparing dates for the overdue/upcoming logic.

## Files

- `index.html` - The HTML structure
- `styles.css` - All the styling. Uses flexbox, animations, and media queries for mobile
- `script.js` - The JavaScript. DOM manipulation, event listeners, `localStorage`, filtering/sorting logic
- `README.md` - This file

## Ideas for next

- Ability to edit due dates after creating a task
- A "Clear completed" button 
- Task categories/tags with colors
- Undo/redo for deleted tasks
- Export tasks as JSON or CSV
- Dark mode
- Animations when adding/deleting tasks

## Tested in

Firefox only - Older browsers probably won't work because it uses ES6 stuff like arrow functions and template literals but anything on the newer end such as Chrome and Edge should be fine.
