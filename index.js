import {ApolloServer, UserInputError, gql } from "apollo-server";
import {v1 as uuid} from 'uuid'
import axios from 'axios'



const typeDefs = gql`

  enum YesNo{
    YES
    NO
  }


  type Address{
    street: String!
    city: String!
  }


  type Person {
    name: String!
    phone: String
    address: Address!
    city: String!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!):Person
  }

  type Mutation{
    addPerson( 
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    editNumber(
      name: String!
      phone: String!
    ): Person
  }
`;

const resolvers = {
  Query: {
    personCount: async() => {
      const {data:persons}= await axios.get('http://localhost:3000/persons')
      // console.log(persons.length);
      return persons.length
    },
    allPersons: async() => {
      const {data:personsFromRestAPI}= await axios.get('http://localhost:3000/persons')
      // console.log(personsFromRestAPI);
      return personsFromRestAPI
      // if (!args.phone) return personsFromRestAPI
      
      // const byPhone = person => args.phone === "YES" ? person.phone : !person.phone

      // return personsFromRestAPI.filter(byPhone)
      
    },
    findPerson: (root, args) =>{
        const {name}= args
        return persons.find(person => person.name === name)
    } 
  },
  Mutation:{
    addPerson:(_, args)=>{
      if (persons.find(p=> p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name
        })
      }
      // const {name, phone, street, city} = args
      const person = {...args, id: uuid()}
      persons.push(person) // update database with new person
      return person
    },
    editNumber: (root, args)=>{
      const personIndex = persons.findIndex(p => p.name=== args.name)
      if(personIndex === -1) return null

      const person = persons[personIndex]

      const updatedPerson = {...person, phone: args.phone}
      persons[personIndex] = updatedPerson
      
      return updatedPerson
    }
  },
//   Person: {
    //   name:(root)=> root.name,
    //   phone:(root)=> root.phone,
    //   street:(root)=> root.street,
    //   city:(root)=> root.city,
    //   id:(root)=> root.id


    // canDrink: (root)=> root.age > 18,
    // address: (root)=> `${root.street}, ${root.city}`,
    // check: ()=> "midu"
// }
  Person: {
    address: (root)=>{
        return{
            street: root.street,
            city: root.city
        }
    }
  }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// arrancar el servidor
server.listen().then( ({url}) =>{
    console.log(`Servidor listo en la URL ${url}`)
} )






