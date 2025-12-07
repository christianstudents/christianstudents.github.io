import { AWSDateForDay } from "/daily/helpers.js";

const endpoint = "https://gi4zexzfnfcbzbz6luibswx2bi.appsync-api.us-west-1.amazonaws.com/graphql";
const apiKey = "da2-kcdik2ri5zflzgicrd2mgaz2dm";

export function fetchDBReadStatus(dayIndex) {
    const queryDate = AWSDateForDay(dayIndex);
    const query = `
      query GetDailyBreadUsers($date: AWSDate!) {
        dailyBreadUsersByDailyBreadDate(dailyBreadDate: $date) {
          items {
            id
            userUsername
            dailyBreadDate
            _version
          }
        }
      }
    `;

    const userId = localStorage.getItem("guestUserId");

    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        },
        body: JSON.stringify({
            query,
            variables: { date: queryDate }
        })
    })
    .then(res => res.json())
    .then(result => {
        if (result.errors) {
            console.error("GraphQL Error:", result.errors);
            return { count: 0, hasRead: false };
        }

        const items = result.data.dailyBreadUsersByDailyBreadDate.items || [];
        const count = items.length;
        const hasRead = items.some(entry => entry.userUsername === userId);
        const userRel = items.find(entry => entry.userUsername === userId);
        // Update UI
        const readIcon = document.getElementById("read-toggle");
        const readButton = document.getElementById('read-button');
        const usersReadLabel = document.getElementById("users-read");

        if (hasRead) {
            readIcon.classList.add("read");
            readIcon.classList.remove("unread");
            readButton.classList.add("read");
            readButton.classList.remove("unread");
            readButton.textContent = "Completed";
            readButton.dataset.dailybreadUserId = userRel.id
            readButton.dataset.dailybreadUserVersion = userRel._version
        } else {
            readIcon.classList.add("unread");
            readIcon.classList.remove("read");
            readButton.classList.add("unread");
            readButton.classList.remove("read");
            readButton.textContent = "Mark as read";
            delete readButton.dataset.dailybreadUserId
            delete readButton.dataset.dailybreadUserVersion
        }

        usersReadLabel.textContent = count > 0 ? `${count} read` : "";
    })
    .catch(err => {
        console.error("Fetch status failed:", err);
    });
}


export async function fetchMRReadStatus(dayIndex) {
    const queryDate = AWSDateForDay(dayIndex);
    const query = `
  query GetDailyBreadUsers($date: AWSDate!) {
    getDailyBread(date: $date) {
      date
      users {
        items {
          id
          user {
            username
            name
          }
        }
      }
    }
  }
`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify({
                query,
                variables: { date: queryDate }
            })
        });

        const result = await response.json();
        if (result.errors) {
            console.error("GraphQL Error:", result.errors);
            return { count: 0, hasRead: false };
        }

        const items = result.data.getDailyBread?.users?.items || [];
        const userId = localStorage.getItem("guestUserId");
        const count = items.length;
        const hasRead = items.some(entry => entry.user.username === userId);
        
        // Update UI
        const readIcon = document.getElementById("read-toggle");
        const usersReadLabel = document.getElementById("users-read");

        if (hasRead) {
            readIcon.classList.add("read");
            readIcon.classList.remove("unread");
        } else {
            readIcon.classList.add("unread");
            readIcon.classList.remove("read");
        }

        usersReadLabel.textContent = count > 0 ? `${count} read` : "";

    } catch (err) {
        console.error("Fetch status failed:", err);
        return { count: 0, hasRead: false };
    }
}