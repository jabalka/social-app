This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

when fetching clientSide in NextJS - good to use library useSWR

NeonPostSQL - for DB in AWS

        Authentication.,
        Connect To DB
        3rd party Providers API
        Interface Library
        Real Time notification = web sockets
## WebSockets server
    -the WebSocket server via Socket.IO enforces NextAuth based user authentication and listens for custom events like message:send. It is initialized once and works on /api/socket route!

## API Routes
    /api/conversations 
        -GET = List user's conversations
    /api/conversations/:id/messages
        -GET = Fetch full thread
    /api/messages
        -POST = Send messages (text/files)

    /api/conversations/with/${userId} 
        -GET get the conversation ID
    /api/conversations/${convoId}/messages 
        -GET fetch ALL messages
## User Roles with Icons

- Each User will have its own role in the app with meaningful icon
  Role |Description |Icon Name (Lucide)
  Citizen |Regular user submitting/engaging |user
  Admin |Platform manager, assigns roles |user-cog
  Mayor |City-level authority |gavel
  Council |Local council member |users
  Planner |Civil engineer/urban planner |compass
  Inspector |Reviews projects, audits |check-circle-2

## Project Categories with Icons

- Project can select up to 3 out of 5 categories to be assigned to.
  Category | Description | Icon Name (Lucide)
  Infrastructure | Roads, bridges, utilities | building
  Environmental | Parks, green spaces, cleanups | leaf
  Education | Schools, libraries, workshops | graduation-cap
  Public Safety | Fire, police, lighting | shield-check
  Transport | Bus stops, bike lanes, signage | bus

## Image Uploading

-it uses supabase API DB to upload images on public domain where later each project can access the related image and be visualized in the app.

## Prisma

                **For local development (first setup):

                npx prisma migrate reset  (command when you want a clean local DB with seed data)
                    -Resets your DB
                    -Applies all migrations
                    -Runs your prisma/seed.ts file (i.e., npx prisma db seed)
                    -Regenerates the Prisma Client

                npx prisma db push  (syncing schema without resetting data)
                npx prisma generate
                    -You just changed your schema but don’t want to lose data
                    -You’re not running real migrations

                npx prisma db seed  (Use this only after db is already set up)

                npx prisma studio   (run the prisma studio)


    -npx prisma generate - generates the prisma schemas
    -npx prisma db push  - populate the db
    -npx prisma db seed  - needs to populate essential data (roles, categories to DB) needs to be ran any first time etc.
    - npx prisma migrate reset - this will automatically run the seed, reset DB and apply migrations

    -npx prisma studio   - run the prisma 
    
## WebSocke IO launch:
 node --loader ts-node/esm src/server/index.ts

## Access the user via user-context everywhere on client side

    - import { useSafeUser } from "@/context/user-context";
    -   const user = useSafeUser();

IT RE-RENDERS EVERYTIME IT REFRESHPROJECTS() AS IT MIGHT BE BEFAUSE OF USEEFFECT

let's say author will be able to delete the whole project (by confirming with typing "delete project" on an input field), edit Title, Description, Images, but this only if project is in stage Proposed, if project is in stage Inn-Progress the only thing author can update or edit is to be able to add more images, if project is in completed stage then author cannot edit it at all.


basically, to change the progress note of project the user must be from one of following roles:
"admin", "council", "mayor", "planner", "inspector".,
and if to change the progress level of project user must be one of following roles:
"admin", "council", "mayor", "inspector".,
and if to change project status a user must be one of following roles:
"admin", "council", "mayor".,
and to change the project categories (if assigned wrong by creator)., user must be one of the following roles:
"admin", "council", "mayor", "planner", "inspector"


## TODO
-ToDO

` \*Giving some issue when assigning categories to a project when created so when to visualize the categories gives an empty array []

    * Create a Profile SidebarMenu with toggle to show Logout, Edit Profile etc.


    * Any project has a state - in progress, proposal, completed (with related icon to it)
    -   This state will be visualized also with a status bar attached to it. (With some animations etc)


    * If more than one project has the same location then they must be visualized as a stack on the map

    -when project is edited
        - title min lenght and max length
        - details min length and max length

        - project progress should not be available to edit bu author but other roles
        - if admin is an author they must be able to edit all data 
        - Save project button does not reflect or update the project
        - Leaving Comment needs to refreshProjects

    -when project to be created
        - description must have few sub descriptions such as:
            - problem
            - suggestion
            - benefits

    -when user reply to a reply of a comment this needs to count onto the parent of the reply, not under the second reply... maybe once reply is clicked to reply to sub-reply the name of which the user reply to could be included in the comment for a reference (like FaceBook)!

    -User can receive notifications
        - when project status is updated
        - when first 10 comments/likes (from there every 10th or so)
        - private message from another user

    -News Feed
        - Mayor and Council can share news that will be marked different from re

    -When Project is viewed on the map and details opened the Images must be bigger and maybe swiper?

    -When on My Projects - user must be able to view / sort the Completed, In Progress etc...




    -MESSAGES:
        - Inbox component: shows recent conversations
        - Chat thread view (ChatRoom): shows messages, scrollable
        - New message input: text + attachment button
        - Real-time updates using WebSocket hook (useSocket())
        \

        *Set up API routes for conversations/messages

        *Add file upload handling (via Supabase or S3)

        *Add a WebSocket or Socket.IO server

        If one chat is open and user types new messages and the receipter is inside the profile/messages but without the chat window open, thenn new messages do not arrive!

    -ENCRYPT THE MESSAGES!!


** It needs to have another Page /directory where we can search for all Projects/ideas/ reports (by location, newest, rating etc...)