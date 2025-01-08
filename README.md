chatgpt-clone
Overview
A simplified ChatGPT clone focusing on the "Edit" prompt feature that creates separate conversation branches, inspired by ChatGPT's implementation on chatgpt.com.

Tech Stack
Next.js: For building the front-end application and server-side rendering.

TypeScript: For type safety and enhanced development experience.

Supabase: For data storage and retrieval.

Setup Instructions
Prerequisites
Node.js(version 14 or higher)

npm (version 6 or higher)

Supabase account

Steps to Connect ChatGPT-3 and Supabase, and Run the Project Locally
Clone the Repository:

bash
git clone https://github.com/Ciloeh/chatgpt-clone.git
cd chatgpt-clone
Install Dependencies:

bash
npm install
Setup Environment Variables:

Create a .env.local file in the root directory of the project.

Add your Supabase and GPT-3 keys and URL to the .env.local file:

env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
Configure Supabase:

Login to your Supabase account and create a new project.

Go to the "API" section in your Supabase project dashboard to find your Supabase URL and Supabase Anon Key. Add these to your .env.local file as shown above.

Set up the tables in your Supabase project according to the following schema:
Users Table

id: Unique identifier for each user (UUID)

username: Unique username for user login

email: Unique email address for user identification

password: Hashed and salted password for user authentication

created_at: Timestamp of user account creation

Conversations Table

id: Unique identifier for each conversation (UUID)

user_id: Foreign key referencing the user who initiated the conversation

created_at: Timestamp of conversation creation

Messages Table

id: Unique identifier for each message (UUID)

user_id: Foreign key referencing the user who sent the message

conversation_id: Foreign key referencing the conversation the message belongs to

content: Text content of the message

tokens_used: Number of tokens used by the language model to generate the message (if applicable)

response_time_ms: Response time of the language model in milliseconds (if applicable)

created_at: Timestamp of message creation

Branches Table

id: Unique identifier for each message branch (UUID)

original_message_id: Foreign key referencing the original message

edited_message_id: Foreign key referencing the edited version of the message

created_at: Timestamp of branch creation

Responses Table

id: Unique identifier for each response (UUID)

message_id: Foreign key referencing the message being responded to

content: Text content of the response

created_at: Timestamp of response creation

Groups Table

id: Unique identifier for each group (UUID)

created_at: Timestamp of group creation

My Provided Schema:
Users Table

sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Conversations Table

sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Messages Table

sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    conversation_id UUID REFERENCES conversations(id),
    content TEXT NOT NULL,
    tokens_used INT,
    response_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Branches Table

sql
CREATE TABLE branches (
    id UUID PRIMARY KEY,
    original_message_id UUID REFERENCES messages(id),
    edited_message_id UUID REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Responses Table

sql
CREATE TABLE responses (
    id UUID PRIMARY KEY,
    message_id UUID REFERENCES messages(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Groups Table

sql
CREATE TABLE groups (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Run the Project Locally:
npm install
bash
npm run dev
Access the Application:

Open your browser and navigate to http://localhost:3000.

Additional Information
Ensure your .env.local file is not pushed to your repository to keep your keys secure.

For more details on configuring Supabase and using its features, refer to the Supabase documentation.
