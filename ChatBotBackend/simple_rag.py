from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os

def load_reviews():
    """Load reviews from the review.txt file"""
    with open("review.txt", "r", encoding="utf-8") as f:
        return f.read()

def create_review_db():
    """Create and populate the vector database with reviews"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    
    reviews = load_reviews()
    review_chunks = text_splitter.split_text(reviews)
    embeddings = OllamaEmbeddings(model="llama3.2:1b")
    
    vectorstore = Chroma.from_texts(
        texts=review_chunks,
        embedding=embeddings,
        persist_directory="./database/macbook_reviews_db"
    )
    return vectorstore

def format_docs(docs):
    """Format retrieved documents with review-specific context"""
    return "\n\n".join(f"Review: {doc.page_content}" for doc in docs)

# Create proper prompt template
prompt = PromptTemplate.from_template("""
You are a helpful assistant that answers questions about MacBook laptop reviews. 
Use the following review excerpts to answer the question. If you're unsure or the information isn't in the reviews, 
say that you don't know based on the available reviews.

Reviews:
{context}

Question: {question}

Answer:""")

# Initialize the QA chain only once
qa_chain = None

def initialize_qa_chain():
    """Initialize the QA chain if not already initialized"""
    global qa_chain
    if qa_chain is None:
        if os.path.exists("./database/macbook_reviews_db"):
            vectorstore = Chroma(
                persist_directory="./database/macbook_reviews_db",
                embedding_function=OllamaEmbeddings(model="llama3.2:1b")
            )
        else:
            vectorstore = create_review_db()
        
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        llm = OllamaLLM(model="llama3.2:1b")
        
        qa_chain = (
            {
                "context": retriever | format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | llm
            | StrOutputParser()
        )
    return qa_chain

def get_answer(question: str) -> str:
    """Main function to be called from the API
    
    Args:
        question (str): The question about MacBook reviews
        
    Returns:
        str: The answer based on the reviews
    """
    try:
        chain = initialize_qa_chain()
        answer = chain.invoke(question)
        return answer
    except Exception as e:
        return f"Error processing question: {str(e)}"

if __name__ == "__main__":
    print("MacBook Review Assistant initialized. Ask questions about MacBook reviews (type 'exit' to quit)")
    while True:
        question = input("\nQuestion: ")
        if question.lower() == "exit":
            break
        answer = get_answer(question)
        print(f"\nAnswer: {answer}\n")