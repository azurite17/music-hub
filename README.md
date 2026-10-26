# *Music Hub*

Created by: **Madison Peterkin**

This web app: **is a social music discussion platform focused on sharing recommendations, opinions, and questions about songs, artists, and genres. Users can create posts with optional long-form text, tag posts by category/genre, and attach images by URL or direct device upload. The home feed supports search, sorting, and filtering so people can discover relevant discussions quickly, while each post page provides comments, upvotes, and repost threading for deeper conversation. The app also includes account-based features like profile customization (including avatar upload), plus an AI-generated summary panel to help readers quickly understand active discussions.**

Time spent: **16** hours spent in total

## Required Features

The following **required** functionality is completed:

- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the *option* for users to add:
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    - creation time
    - upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page.
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times
- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:

- [X] Web app implements pseudo-authentication
  - Upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
- [x] Users can repost a previous post by referencing its post ID. On the post page of the new post
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [x] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [x] Users can add more characterics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [x] Web app displays a loading animation whenever data is being fetched

The following **additional** features are implemented:

* [x] Email/password authentication plus Google OAuth via Supabase Auth
* [x] User profiles with editable display name, bio, links, and avatar upload from device
* [x] AI post summary panel (Supabase Edge Function + Groq LLM API, configurable endpoint)
* [x] Genre tagging and filtering support
* [x] Netlify-ready SPA routing (`_redirects` + `netlify.toml`)

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='https://private-user-images.githubusercontent.com/212908794/586779071-e2f09110-b68e-4356-89f4-ae84818d61e5.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODI3NjEyMTksIm5iZiI6MTc4Mjc2MDkxOSwicGF0aCI6Ii8yMTI5MDg3OTQvNTg2Nzc5MDcxLWUyZjA5MTEwLWI2OGUtNDM1Ni04OWY0LWFlODQ4MThkNjFlNS5naWY_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjI5JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYyOVQxOTIxNTlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1kYTk0ZTkyYmZiZDEyMjAyYjI4MjQ5OTA3MmVlMmE3MmI0N2I2NTY2OTZiNTRmMmMxNjEyYWQ4N2Q5YmJlOWI4JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZnaWYifQ.FmMeExe6_sGvVVgBQcmbFe2l9DjYNoq9wQvWupkWTwI' title='Video Walkthrough' width='' alt='Video Walkthrough' />

[![Watch the video](https://img.youtube.com/vi/Pg-qwXkSbcE/0.jpg)](https://youtu.be/Pg-qwXkSbcE) 

GIF created with ...

[ScreenToGif](https://www.screentogif.com/) for Windows



## License

    Copyright [2026] [Madison Peterkin]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
