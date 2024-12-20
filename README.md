# 🚀 React Virtualized List Component

A lightweight, performant virtualized list implementation for React applications. This component efficiently renders large lists by only mounting the visible items in the DOM.

## ✨ Features

- 🎯 Dynamic height support for list items
- 📏 Automatic measurement of item heights
- 🔄 Smooth scrolling experience
- 🎨 Customizable styling
- 💪 TypeScript support
- 🔍 Smart pre-fetching of upcoming items
- 📦 Zero dependencies (except React)

## 🔧 Installation

```bash
npm install virtualized-react
# or
yarn add virtualized-react
```

## 💻 Usage

Here's a simple example of how to use the VirtualizedList component:

```JS
import React from 'react';
import { VirtualizedList } from 'virtualized-react';

const App = () => {
  // Create an array of 1000 items
  const items = Array(1000).fill(null).map((_, index) => (
    <div key={index}>
      <h3>Item {index + 1}</h3>
      <p>This is a list item with dynamic content</p>
    </div>
  ));

  return (
    <div style={{ height: '400px' }}>
      <VirtualizedList items={items} />
    </div>
  );
};

export default App;
```

## 🎯 Props

| Prop  | Type          | Description                            | Required |
| ----- | ------------- | -------------------------------------- | -------- |
| items | JSX.Element[] | Array of React elements to be rendered | Yes      |

## 📝 Notes

- The parent container must have a defined height.
- Each item can have a different height.
- The component automatically handles window resizing.
- Optimal performance with up to 10,000+ items.

## 🌟Advanced Usage

```JS
import React from 'react';
import { VirtualizedList } from 'virtualized-react';

const AdvancedExample = () => {
  const complexItems = Array(1000).fill(null).map((_, index) => (
    <div key={index}>
      <h3>Complex Item {index + 1}</h3>
      <div style={{ padding: '10px' }}>
        <img src={`https://placekitten.com/50/50?image=${index}`} alt="Cat" />
        <p>Some dynamic content that can vary in height</p>
        {index % 2 === 0 && (
          <div>Extra content that appears in some items</div>
        )}
      </div>
    </div>
  ));

  return (
    <div style={{ height: '600px', width: '100%', maxWidth: '800px' }}>
      <VirtualizedList items={complexItems} />
    </div>
  );
};
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
