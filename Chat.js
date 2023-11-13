import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// The Chat component displays an interactive chat interface for communication with Chat GPT
function Chat({ className, shouldAutoScroll, showInputSection = true, showLoadingImage = true }) {

    // States
    const [botText, setBotText] = useState("");         // The current text being typed by the bot
    const [messages, setMessages] = useState([]);       // List of chat messages
    const [stableImage, updateStableImage] = useState();// Image fetched from the server
    const [imageLoaded, setImageLoaded] = useState(false); // Track if the image has been loaded
    const [apiResponse, setApiResponse] = useState(null);  // Response from the API after sending a message

    // Refs
    const inputRef = useRef(null);                      // Reference to the chat input field
    const stableImageRef = useRef(null);                // Reference to the fetched image element
    const messagesEndRef = useRef(null);                // Reference to the bottom of the message list (for auto-scrolling)
    const handleKeyDownRef = useRef(null);              // Reference to handleKeyDown function (for event listener)

    // Constants
    const systemPrompt = "Your custom instructions to the AI."; // Initial system prompt (similar to current GPT-4 custom AI personalities, but with more customization.)
    const abortController = useMemo(() => new AbortController(), []); // AbortController for fetch requests
    const signal = abortController.signal;              // Abort signal from AbortController

    // Callback to format messages in a way that the API understands
    const formatMessagesForAPI = useCallback(() => {
        return messages.flatMap((msg, index) => [
            { role: "user", content: msg.user },
            { role: "assistant", content: index === messages.length - 1 ? "" : msg.bot },
        ]);
    }, [messages]);

    // Callback to scroll to the bottom of the chat messages
    const scrollToBottom = useCallback(() => {
        if (shouldAutoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [shouldAutoScroll]);

    // Typewriter effect for the bot's response
    const typeWriter = useCallback(async (response, speed, char, onFinish) => {
        let text = await response;
        if (response) {
            if (char < text.length) {
                setBotText((prevBotText) => prevBotText + text.charAt(char));
                setTimeout(typeWriter, speed, text, speed, char + 1, onFinish);
                if (!char.current) {
                    scrollToBottom();
                };
            }
        } else {
            onFinish();
        }
    }, [scrollToBottom]);

    // Callback to add a new chat entry with bot's response
    const addChatEntry = useCallback((response) => {
        setTimeout(() => {
            typeWriter(response, 40, 0, () => {
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].bot = response;
                    return newMessages.slice(Math.max(newMessages.length - 5, 0));
                });
            });
        }, 0);
    }, [setMessages, typeWriter]);

    // Callback to fetch an image based on the prompt provided
    const fetchImage = useCallback(async (input) => {
        console.log("Fetching Image...");
        try {                               // Replace with http://localhost:3000 when testing
            const response = await fetch(`https://YourWebsite.com/api/get-image/?prompt=${input}`, { method: 'GET' });
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            const result = await response.text();
            const imageURL = `data:image/png;base64,${result}`;
            updateStableImage(imageURL);
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Fetch error: ', err);
        }
    }, [updateStableImage]);

    // Determine the bot's response and fetch the relevant image
    const determineResponse = useCallback((input, apiResponse) => {
        let response = input ? `${apiResponse}` : "Test failed.";
        fetchImage(apiResponse);
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].bot = response;
            return newMessages.slice(Math.max(newMessages.length - 5, 0));
        });
        addChatEntry(response);
    }, [addChatEntry, fetchImage]);

    // Callback to fetch data from the GPT API
    const fetchData = useCallback(async (input) => {
        console.log("Fetching API response...");
        const formatedMessages = formatMessagesForAPI();
        console.log("Formatted messages: ", formatedMessages);
        try {                               // Replace with http://localhost:3000 when testing
            const response = await fetch('https://YourWebsite.com/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: `${systemPrompt}` },
                        ...formatedMessages,
                        { role: "user", content: `${input}` }
                    ],
                }),
                signal: signal,  // Use the abort signal for cancellable fetch
            });
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            const data = await response.json();
            console.log("Total tokens used in this instance: ", data.tokens);
            setApiResponse(data.message);
            determineResponse(input, data.message);  // Process the received response and fetch image
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Fetch error: ', err);
        }
        return () => abortController.abort(); // Clean up the fetch request if the component is unmounted
    }, [setApiResponse, formatMessagesForAPI, determineResponse, abortController, signal]);

    // Effect for handling user's Enter key press to send a message
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Enter") {
                let input = inputRef.current.value;
                inputRef.current.value = "";  // Clear the input field
                setBotText("");   // Reset the bot's message
                setMessages((prevMessages) => [
                    ...prevMessages.slice(Math.max(prevMessages.length - 5, 0)),  // Keep the last 5 messages
                    { user: input, bot: "" },
                ]);
                fetchData(input);  // Fetch the response from the API
            }
        };
        handleKeyDownRef.current = handleKeyDown;
        const currentInputRef = inputRef.current;
        if (currentInputRef) {
            currentInputRef.addEventListener("keydown", handleKeyDown);  // Attach the keydown event
        }
        return () => {
            if (currentInputRef) {
                currentInputRef.removeEventListener("keydown", handleKeyDownRef.current);  // Cleanup
            }
        };
    }, [inputRef, fetchData]);

    // Effect to auto-scroll and log message changes
    useEffect(() => {
        scrollToBottom();
        console.log("Logging messages state array: ", messages);
    }, [messages, scrollToBottom]);

    // Effect to reset image loading state when a new API response arrives
    useEffect(() => {
        setImageLoaded(false);
    }, [apiResponse]);

    // Render the chat UI
    return (
        <>
            <div id="chatContainer" className={`${className}`}>
                <div id="chat" className="chat">
                    <div id="messages" className="messages">
                        {messages.map((msg, i) => (
                            <div key={i} className='message'>
                                <div id="user" className="user response">{msg.user}</div>
                                <div id="bot" className="bot response">{i === messages.length - 1 ? botText : msg.bot}</div>
                            </div>
                        ))}
                        <div ref={messagesEndRef}></div>
                    </div>
                </div>
                <div className='chatImage'>
                    {stableImage ?
                        <img
                            key={stableImage}
                            src={stableImage}
                            alt="img"
                            ref={stableImageRef}
                            onLoad={() => setImageLoaded(true)}
                            style={{ opacity: imageLoaded ? 1 : 0 }}
                        /> : null
                    }
                </div>
            </div>
            {showInputSection ? <input id="input" type="text" placeholder="Write something..." ref={inputRef} autoComplete="off" autoFocus={true} /> : null}
        </>
    );
}

export default Chat;
