import React, { useState, useEffect, useRef } from "react";

export const VirtualizedList = ({ items }: { items: JSX.Element[] }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);
  const resizeObserver = useRef(null);
  const [itemHeights, setItemHeights] = useState({});
  const [totalHeight, setTotalHeight] = useState(0);
  const measurementContainerRef = useRef(null);
  const [isInitialMeasurement, setIsInitialMeasurement] = useState(true);
  const [measurementQueue, setMeasurementQueue] = useState([]);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // ResizeObserver for container
  useEffect(() => {
    if (containerRef.current) {
      // @ts-ignore
      resizeObserver.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      // @ts-ignore
      resizeObserver.current.observe(containerRef.current);
    }
    return () => {
      if (resizeObserver.current) {
        // @ts-ignore
        resizeObserver.current.disconnect();
      }
    };
  }, []);

  // Function to measure an item's height
  const measureItem = (index: number, element: HTMLDivElement | null) => {
    // @ts-ignore
    if (element && !itemHeights[index]) {
      const height = element.getBoundingClientRect().height;
      setItemHeights((prev) => ({
        ...prev,
        [index]: height,
      }));
      return height;
    }
    // @ts-ignore
    return itemHeights[index] || 0;
  };

  // Pre-measure upcoming items
  const preMeasureItems = async (startIdx: number, count: number) => {
    if (isMeasuring || !measurementContainerRef.current) return;

    setIsMeasuring(true);
    const newHeights = { ...itemHeights };
    const unmeasuredItems = [];

    // Find items that need measurement
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      // @ts-ignore
      if (idx < items.length && !itemHeights[idx]) {
        // @ts-ignore
        // @ts-ignore
        unmeasuredItems.push(idx);
      }
    }

    if (unmeasuredItems.length > 0) {
      // Create temporary elements for measurement
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.visibility = "hidden";
      // @ts-ignore
      tempContainer.style.width = `${containerRef.current.offsetWidth}px`;
      document.body.appendChild(tempContainer);

      for (const idx of unmeasuredItems) {
        const element = document.createElement("div");
        element.style.padding = "8px";
        element.style.borderBottom = "1px solid #eee";

        // Create a temporary React root and render the item
        const root = document.createElement("div");
        element.appendChild(root);
        tempContainer.appendChild(element);

        // Render the item content
        root.innerHTML = "";
        const tempElement = items[idx];
        if (typeof tempElement === "string") {
          root.textContent = tempElement;
        } else {
          // For React elements, we'll need to create a simple representation
          root.innerHTML = tempElement.props.children
            .map((child: { props: { children: any } }) =>
              typeof child === "string" ? child : child.props.children
            )
            .join(" ");
        }
        // @ts-ignore
        newHeights[idx] = element.getBoundingClientRect().height;
      }

      document.body.removeChild(tempContainer);
      setItemHeights(newHeights);
    }

    setIsMeasuring(false);
  };

  // Calculate visible range with pre-fetching
  const getVisibleRange = () => {
    let currentHeight = 0;
    let startIndex = 0;
    let endIndex = 0;
    let startOffset = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      // @ts-ignore
      const height = itemHeights[i] || 0;
      if (currentHeight + height > scrollTop) {
        startIndex = i;
        startOffset = currentHeight;
        break;
      }
      currentHeight += height;
    }

    // Find end index
    currentHeight = startOffset;
    for (let i = startIndex; i < items.length; i++) {
      // @ts-ignore
      const height = itemHeights[i] || 0;
      if (currentHeight > scrollTop + containerHeight) {
        endIndex = i;
        break;
      }
      currentHeight += height;
    }

    // Add buffer
    startIndex = Math.max(0, startIndex - 2);
    endIndex = Math.min(items.length, endIndex + 5); // Increased buffer for pre-measuring

    return { startIndex, endIndex, startOffset };
  };

  // Handle scroll with pre-measurement
  const handleScroll = (event: {
    target: { scrollTop: React.SetStateAction<number> };
    stopPropagation: () => void;
  }) => {
    setScrollTop(event.target.scrollTop);
    event.stopPropagation();

    // Trigger pre-measurement for upcoming items
    const { endIndex } = getVisibleRange();
    preMeasureItems(endIndex, 5); // Pre-measure 5 items ahead
  };

  // Calculate total height
  useEffect(() => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      // @ts-ignore
      total += itemHeights[i] || 0;
    }
    setTotalHeight(total);
  }, [itemHeights, items.length]);

  // Initial measurement setup
  useEffect(() => {
    if (isInitialMeasurement && items.length > 0) {
      const initialVisibleCount = Math.ceil(containerHeight / 50); // Estimate initial visible count
      preMeasureItems(0, initialVisibleCount + 5) // Measure initial visible items plus 5 more
        .then(() => setIsInitialMeasurement(false));
    }
  }, [containerHeight, items, isInitialMeasurement]);

  const { startIndex, endIndex, startOffset } = getVisibleRange();
  const visibleItems = items.slice(startIndex, endIndex);

  const containerStyle = {
    height: "100%",
    overflowY: "auto",
    position: "relative",
    border: "1px solid #ccc",
    margin: "0",
    padding: "0",
    boxSizing: "border-box",
  };

  const scrollContentStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    height: `${totalHeight}px`,
  };

  const itemsContainerStyle = {
    position: "absolute",
    top: `${startOffset}px`,
    left: "0",
    right: "0",
  };

  return (
    // @ts-ignore
    <div ref={containerRef} onScroll={handleScroll} style={containerStyle}>
      {/* @ts-ignore */}
      <div style={scrollContentStyle}>
        {/* @ts-ignore */}
        <div style={itemsContainerStyle}>
          {visibleItems.map(
            (
              item:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | null
                | undefined,
              index: number
            ) => (
              <div
                key={startIndex + index}
                ref={(el) => measureItem(startIndex + index, el)}
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fff",
                }}
              >
                {item}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
