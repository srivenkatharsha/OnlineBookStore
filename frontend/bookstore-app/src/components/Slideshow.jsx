import React from 'react';

const images = [
    {
        url: "../../static/book-1.jpg",
        title: "Whimsical",
        description: "Imagination's playground."
    },
    {
        url: "../../static/book-2.jpg",
        title: "Enchanting",
        description: "Stories that transport."
    },
    {
        url: "../../static/book-3.jpg",
        title: "Captivating",
        description: "Unputdownable tales."
    }
];

const delay = 4000;

function Slideshow() {
    const [index, setIndex] = React.useState(0);
    const timeoutRef = React.useRef(null);

    function resetTimeout() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    React.useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, delay);

        return () => {
            resetTimeout();
        };
    }, [index]);

    return (
        <div className="slideshow">
            <div className="slideshowSlider">
                <div
                    className="slidesContainer"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {images.map((image, idx) => (
                        <div className="slide" key={idx} style={{ backgroundImage: `url(${image.url})` }}>
                            {/* Text container */}
                            <div className="slideTextContainer">
                                <h2>{image.title}</h2>
                                <p>{image.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    
            {/* Dots */}
            <div className="slideshowDotsOnSlider">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`slideshowDot${index === idx ? " active" : ""}`}
                        onClick={() => {
                            setIndex(idx);
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
}

export default Slideshow;
