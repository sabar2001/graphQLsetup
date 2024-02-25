const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {expressGraphQL} = require('express-graphql').graphqlHTTP; // Use correct import syntax



const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')


const app = express();



const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Represents a author of the book',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (Author) => {
                return books.filter(book => book.authorId == Author.id)
            }
        }
    })
})



const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'Represents a book by an author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLString)},
        author: {
            type: AuthorType,
            resolve: (Book) => {
                return authors.find(author => author.id == Book.authorId)
            }
        }
    })
})



const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () =>  ({
        book: {
            type: BookType,
            description: 'Single book',
            args: {
                id: {type: GraphQLInt},
                name: {type: GraphQLString}
            }, 
            resolve: (parent, args) => books.find(book => book.id == args.id || book.name == args.name)
        },
        books: {
            type: GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books // here we actually query the db instead of using predefine const books
        },
        authors: {
            type: GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors // here we actually query the db instead of using predefine const books
        },
        author: {
            type: AuthorType,
            description: 'Single Author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id == args.id) // here we actually query the db instead of using predefine const books
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {type : GraphQLNonNull(GraphQLString)},
                authorId: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {id: books.length + 1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: {type : GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = {id: authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(3000, () => console.log('Server Running'));