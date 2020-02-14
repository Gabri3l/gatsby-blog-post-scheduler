# create-gatsby-blog-post

A simple CLI to generate and schedule a blog post based with Gatsby.

The CLI should do the following in this order:

- ask the user if they want github actions to automatically merge at the given date
- if they say yes
- check if user is logged into github, if not log the user in
- check if the github action is enabled, if not add the necessary file, commit and push to remote
- git branch
- git checkout
- generate blog post folder + file + content
- git commit
- git push
- submit pr with description + title
