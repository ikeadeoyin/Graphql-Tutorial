const { createServer, GraphQLYogaError } = require('@graphql-yoga/node')
import { v4 as uuidv4 } from 'uuid';

// demo users

const usersData = [
  {
    id: "1",
    email: "oyin@gmail.com",
    name: "Oyin",
    age: 20,
    employed: true,
    gpa: 4.8

  },
  {
    id: "2",
    email: "asake@gmail.com",
    name: "Asake",
    age: 5,
    employed: false,
    gpa: 2.2
  }
]

// demo posts
const demoPosts = [
  {
    id: "1",
    title: "Intro to Graphql",
    body: "Graphql is a little advanced than REST API",
    published: false,
    author: "2"
  },
  {
    id: "2",
    title: "Backend Devs are the best",
    body: "Yes, we are the best!",
    published: true,
    author: "1"
  }
]

// demo comments
const demoComments = [
  {
    id: "23",
    text: "Very informative post",
    author: "1",
    post: "1"
  }, {
    id: "44",
    text: "She is cynical",
    author: "2",
    post: "1"
  }
]
// Provide your schema

const typeDefs = `
type Query{
  me: User!
  post: Post
  users: [User!]!
  posts: [Post!]!
  comments: [Comment!]!
}

type Mutation{
  createUser(data: createUserInput): User!
  createPost(data: createPostInput): Post!
  createComment(data: createCommentInput): Comment!
}

input createUserInput{
  name: String!,
   email:String!, 
   age: Int

}

input createPostInput{
  title: String!, 
  body: String!, 
  published: Boolean!, 
  author: ID!

}

input createCommentInput{
  text: String!, 
  author: ID!, 
  post: String!
}


type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  employed: Boolean!
  gpa: Float!
  posts: [Post!]!
  comments: [Comment!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  published: Boolean!
  author: User!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}
`

const resolvers = {
  Query: {
    me: () => {
      return {
        id: "ab21",
        email: "ibukun@gmail.com",
        name: "Ibukun",
        age: 12,
        employed: true,
        gpa: () => 4.1,

      }
    },
    post: () => {
      return {
        id: "as21",
        title: "Agbara Jesu",
        body: "gfhujh uf fyi sij",
        published: false,
        author: "ab21"
      }
    },
    users: () => usersData,
    posts: () => demoPosts,
    comments: () =>  demoComments
    
  },
  Mutation: {
    createUser: (parent, args, context, info)=> {
      const emailTaken = usersData.some((user) => {
        return user.email === args.data.email
      })

      if(emailTaken) {
        throw new GraphQLYogaError("Email taken")
      }

      const user = {
        id: uuidv4(),
      //   name: args.name,
      //   email: args.email,
      //   age: args.age
      ...args.data
      }

      usersData.push(user)
      return user
    },
    createPost: (parent, args, context, info) => {
      const userExists = usersData.find((user) => {
        return user.id === args.data.author
      })

      if (!userExists) {
        console.log("error")
        throw new GraphQLYogaError("User not found!")
       
      }

      const post = {
        id: uuidv4(),
        ...args.data
        // body: args.body,
        // published: args.published,
        // author: args.author
      }

      demoPosts.push(post)
      return post
    },
    createComment: (parent, args, context, info) => {
      const userExists = usersData.some((user) => {
        return user.id === args.data.author
      })
      const postExists = demoPosts.some((post)=>{
        return post.id === args.data.post && post.published === true
      })

      if (!userExists || !postExists) {
        console.log("error")
        throw new GraphQLYogaError("User/Post not found!")
       
      }
      const comment = {
        id: uuidv4(),
        ...args.data
        // text: args.text,
        // author: args.author,
        // post: args.post
      }

      demoComments.push(comment)

      return comment

    }
  },
  Post: {
    author: (parent, args, context, info) => {
    return usersData.find((user)=>{
      return user.id === parent.author
    })
    },
    comments:  (parent, args, context, info) => {
      return demoComments.find((comment)=>{
        return comment.post === parent.id
      })
    }

},
  User:{
    posts: (parent, args, context, info) => {
      return demoPosts.filter(post => {
        return post.author === parent.id
      })
    },
    comments:  (parent, args, context, info) => {
      return demoComments.filter((comment)=>{
        return comment.author === parent.id
      })
    }
  },
  Comment: {
    author: (parent, args, context, info) => {
      return usersData.find((user) => {
        return user.id === parent.author
      })
    },
    post:  (parent, args, context, info) =>{
      return demoPosts.find((post) => {
        return post.id === parent.post
      })
    }
  }
}


const server = createServer({
  schema: {
    typeDefs: typeDefs,
    resolvers: resolvers
  },
})

// Start the server and explore http://localhost:4000/graphql
server.start()