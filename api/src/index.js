const { ApolloServer, gql } = require('apollo-server');
const { MongoClient, ObjectID } = require('mongodb');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const { DB_URL, DB_NAME, JWT_SECRET } = process.env;

const getToken = (user) => jwt.sign({id: user._id}, JWT_SECRET, { expiresIn: '7 days' });

const getUserFromToken = async (token, db) => {
    if (!token) { return null }

    const tokenData = jwt.verify(token, JWT_SECRET);
    if (!tokenData?.id) {
        return null;
    }

    return await db.collection('Users').findOne({ _id: ObjectID(tokenData.id) });
}

const typeDefs = gql`
    type Query {
        myTaskLists: [TaskList!]!
        getTaskList(id: ID!): TaskList
    }

    type Mutation {
        signUp(input: SignUpInput!): AuthUser!
        signIn(input: SignInInput!): AuthUser!
        createTaskList(title: String!): TaskList!
        updateTaskList(id: ID!, title: String!): TaskList!
        deleteTaskList(id: ID!): Boolean!
        addUserToTaskList(taskListId: ID!, userId: ID!): TaskList
        createTodo(content: String!, taskListId: ID!): Todo!
        updateTodo(id: ID!, content: String, isCompleted: Boolean): Todo!
        deleteTodo(id: ID!): Boolean!
    }

    input SignUpInput {
        email: String!
        password: String!
        name: String!
        avatar: String
    }

    input SignInInput {
        email: String!
        password: String!
    }

    type AuthUser {
        user: User!
        token: String!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        avatar: String
    }

    type TaskList {
        id: ID!
        createdAt: String!
        title: String!
        progress: Float!
        users: [User!]!
        Todos: [Todo!]!
    }

    type Todo {
        id: ID!
        content: String!
        isCompleted: Boolean!
        taskList: TaskList!
    }
`;

const resolvers = {
    Query: {
        myTaskLists: async (_, __, { db, user }) => {
            if (!user) { throw new Error('Authentication Error. Please sign in'); }
      
            return await db.collection('TaskList')
                                      .find({ userIds: user._id })
                                      .toArray();
        },

        getTaskList: async(_, { id }, { db, user }) => {
            if (!user) { throw new Error('Authentication Error. Please sign in'); }
            
            return await db.collection('TaskList').findOne({ _id: ObjectID(id) });
        }
    },
    Mutation: {
        signUp: async (_, { input }, { db }) => {
            const hashedPassword = bcrypt.hashSync(input.password);
            const newUser = {
                ...input,
                password: hashedPassword,
            }

            // save to database
            const result = await db.collection('Users').insertOne(newUser);
            const user = db.collection('Users').findOne();

            return {
                user,
                token: getToken(user),
            }
        },

        signIn: async (_, { input }, { db }) => {
            const user = await db.collection('Users').findOne({ email: input.email});
            if (!user) {
                throw new Error('Invalid credentials!');
            }

            // check if password is correct
            const isPasswordCorrect = bcrypt.compareSync(input.password, user.password);
            if (!isPasswordCorrect) {
                throw new Error('Invalid credentials!');
            }

            return {
                user,
                token: getToken(user),
            }
        },

        createTaskList: async (_, { title }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error!');
            }

            const newTaskList = {
                title,
                createdAt: new Date().toISOString(),
                userIds: [user._id]
            }

            const result = await db.collection('TaskList').insertOne(newTaskList);

            return db.collection('TaskList').findOne();


        },

        updateTaskList: async (_, { id, title}, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error!');
            }

            const result = await db.collection('TaskList').updateOne({
                _id: ObjectID(id)
            }, {
                $set: {
                    title
                }
            })

            return await db.collection('TaskList').findOne();
        },

        addUserToTaskList: async (_, { taskListId, userId}, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error!');
            }

            const taskList = await db.collection('TaskList').findOne({ _id: ObjectID(taskListId) });

            if (!taskList) {
                return null;
            }

            if (taskList.userIds.find((dbId) => dbId.toString() === userId.toString())) {
                return taskList;
            }

            await db.collection('TaskList').updateOne({
                _id: ObjectID(taskListId)
            }, {
                $push: {
                    userIds: ObjectID(userId),
                }
            })

            taskList.userIds.push(ObjectID(userId))
            return taskList;
        },

        deleteTaskList: async (_, { id }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error!');
            }

            await db.collection('TaskList').deleteOne({ _id: ObjectID(id) });

            return true;
        },

        // Todo Items
        createTodo: async (_, { content, taskListId }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error!');
            }

            const newTodo = {
                content,
                taskListId: ObjectID(taskListId),
                isCompleted: false,
            }

            const result = await db.collection('Todo').insert(newTodo);
            return await db.collection('Todo').findOne(); 
        },

        updateTodo: async (_, data, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error!');
            }

            const result = await db.collection('Todo').updateOne({
                _id: ObjectID(data.id)
            }, {
                $set: data
            })

            return await db.collection('Todo').findOne({ _id: ObjectID(data.id) });
        },

        deleteTodo: async (_, { id }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error!');
            }

            await db.collection('Todo').deleteOne({ _id: ObjectID(id) });

            return true;
        },
    },

    User: {
        id: ({ _id, id }) => _id || id
    },

    TaskList: {
        id: ({ _id, id }) => _id || id,
        progress: async ({ _id }, _, { db }) => {
            const Todos = await db.collection('Todo').find({ taskListId: ObjectID(_id)}).toArray();
            const completed = Todos.filter(Todo => Todo.isCompleted);

            if  (Todos.length === 0) {
                return 0;
            }

            return 100 * completed.length / Todos.length;
        },
        users: async ({userIds}, _, { db }) => Promise.all(
            userIds.map((userId) => (
                db.collection('Users').findOne({ _id: userId }))
            )   
        ),
        Todos: async ({ _id }, _, { db }) => {
            return await db.collection('Todo').find({ taskListId: ObjectID(_id)}).toArray();
        },
    },

    Todo: {
        id: ({ _id, id }) => _id || id,
        taskList: async ({ taskListId }, _, { db }) => (await db.collection('TaskList').findOne({ _id: ObjectID(taskListId) }))
    },
};

const start = async () => {
    const client = new MongoClient(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(DB_NAME);

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const server = new ApolloServer({ 
        typeDefs, 
        resolvers, 
        context: async ({ req }) => {
            const user = await getUserFromToken(req.headers.authorization, db);
            return {
                db,
                user,
            }
        },
    });

    // The `listen` method launches a web server.
    server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
    });
}

start();