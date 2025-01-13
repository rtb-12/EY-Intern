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
    # Initialize text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    
    # Load and split reviews
    reviews = load_reviews()
    review_chunks = text_splitter.split_text(reviews)
    
    # Initialize embeddings
    embeddings = OllamaEmbeddings(model="llama3.2:latest")
    
    # Create and persist vectorstore
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

def create_qa_chain():
    """Create the QA chain specifically for product reviews"""
    if os.path.exists("./database/macbook_reviews_db"):
        vectorstore = Chroma(
            persist_directory="./database/macbook_reviews_db",
            embedding_function=OllamaEmbeddings(model="llama3.2:latest")
        )
    else:
        vectorstore = create_review_db()
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    llm = OllamaLLM(model="llama3.2:latest")
    
    # Fix chain construction
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

def main():
    print("MacBook Review Assistant initialized. Ask questions about MacBook reviews (type 'exit' to quit)")
    qa_chain = create_qa_chain()
    
    while True:
        question = input("\nQuestion: ")
        if question.lower() == "exit":
            break
        try:
            answer = qa_chain.invoke(question)
            print(f"\nAnswer: {answer}\n")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()