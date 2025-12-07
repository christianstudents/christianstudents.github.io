// Check if we already have a guest ID in localStorage
let guestId = localStorage.getItem('guestUserId');

if (guestId) {
    console.log("Using existing guest ID:", guestId);
} else {
    // Configure AWS SDK for Cognito Identity
    AWS.config.region = 'us-west-1'; // Your region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-west-1:312cd3af-98e3-452a-b196-53c97183154f'
    });

    // Get new guest identity from Cognito
    AWS.config.credentials.get(function (err) {
        if (err) {
            console.error("Error getting guest ID:", err);
            return;
        }

        guestId = AWS.config.credentials.identityId;
        console.log("Generated new guest ID:", guestId);

        // Store it in localStorage for future sessions
        localStorage.setItem('guestUserId', guestId);

        createGuestUser(guestId)
    });

}



async function createGuestUser(guestId) {
    const endpoint = "https://gi4zexzfnfcbzbz6luibswx2bi.appsync-api.us-west-1.amazonaws.com/graphql";
    const apiKey = "da2-kcdik2ri5zflzgicrd2mgaz2dm";
    // GraphQL mutation
    const mutation = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      username
      name
      anonymous
    }
  }
`;


    // Variables
    const variables = {
      input: {
        username: guestId,
        name: "anon",
        anonymous: true
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      });

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
      } else {
        console.log("Guest user created:", result.data.createUser);
      }
    } catch (err) {
      console.error("Error creating guest user:", err);
    }
  }
