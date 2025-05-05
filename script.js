const Container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-conatiner");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");



const API_URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDWYM24uClTsGBj58dxQ4pMj1r6Msu4abo'

let userMessage = "";
const chatHistory = [];

const createMsgElement = (content, ...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
}

const scrollToBottom = () => Container.scrollTo({top: Container.scrollHeight, behavior:"smooth"});

const typingEffect = (text, textElement, botMsgDiv) =>{
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    const typingInterval = setInterval(() =>{
        if(wordIndex < words.length){
            textElement.textContent += (wordIndex === 0 ? "":" ")+ words[wordIndex++];
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
        }else{
            clearInterval(typingInterval);
        }
    },40)
}

const generateResponse = async(botMsgDiv) =>{
    const textElement = botMsgDiv.querySelector(".message-text")

    chatHistory.push({
        role:"user",
        parts:[{text: userMessage}]
    })
    try{
        const response = await fetch(API_URL,{
            method:"POST",
            headers:{"content-Type": 'application/json' },
            body:JSON.stringify({ contents:chatHistory})
        });

        const data = await response.json();
        if(!response.ok)throw new Error(data.error.message);

        const responseText= data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g,"$1").trim();
        typingEffect(responseText,textElement,botMsgDiv);
        
        chatHistory.push({role:"model",parts:[{text:responseText}]});

    }catch(error){
        console.log(error)
    }
}

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage ||document.body.classList.remove("bot-respondig","chats-active"))return;

    promptInput.value="";
    document.body.classList.add("chats-active")

    const userMsgHTML = '<p class="message-text"></p>';
    const userMsgDiv = createMsgElement(userMsgHTML,"user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() =>{

    const botMsgHTML = '<img src="gemini.svg" alt="img" class="avatar"><p class="message-text">Just a sec...</p>';
    const botMsgDiv = createMsgElement(botMsgHTML,"bot-message","loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
    },600);
}

document.querySelector("#delete-chats-btn").addEventListener("click",() =>{
    chatHistory.length= 0;
    chatsContainer.innerHTML= "";
    document.body.classList.remove("bot-respondig","chats-active")
})


promptForm.addEventListener("submit",handleFormSubmit); 