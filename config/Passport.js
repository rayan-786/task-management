const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const axios = require("axios");

const User = require("../models/User");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        "https://task-manage.duckdns.org/api/auth/github/callback",
      scope: ["user:email"],
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        

        let email = profile.emails?.[0]?.value;

        // If GitHub didn't return email in profile
        if (!email) {
          const emailsRes = await axios.get(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `token ${accessToken}`,
                Accept: "application/vnd.github+json",
              },
            }
          );

          const primaryEmail = emailsRes.data.find(
            (e) => e.primary && e.verified
          );

          email = primaryEmail?.email;
        }

        if (!email) {
          return done(
            new Error(
              "No verified GitHub email found"
            ),
            null
          );
        }

        let user = await User.findOne({
          email,
        });

        if (!user) {
          user = await User.create({
            name:
              profile.displayName ||
              profile.username,

            email,

            githubId: profile.id,
          });
        }

        return done(null, user);
      } catch (err) {
        console.error(
          "GitHub Auth Error:",
          err
        );

        return done(err, null);
      }
    }
  )
);

module.exports = passport;