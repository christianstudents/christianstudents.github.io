
import { AWSDateForDay } from "/daily/helpers.js";
import { getCurrentDayIndex } from "./scrollbar.js";
import { fetchDBReadStatus } from "./readstatus.js";
const readButton = document.getElementById("read-button");

const endpoint = "https://gi4zexzfnfcbzbz6luibswx2bi.appsync-api.us-west-1.amazonaws.com/graphql";
const apiKey = "da2-kcdik2ri5zflzgicrd2mgaz2dm";

readButton.addEventListener("click", () => {
    if (!readButton.classList.contains("read")) {
        // Mark as read
        readButton.classList.remove("unread");
        readButton.classList.add("read");
        readButton.textContent = "Completed";

        // TODO: call backend to record that user has read
        markDailyBreadRead()
        console.log("User marked as read!");
    } else {
        // If you want toggle back to unread
        readButton.classList.remove("read");
        readButton.classList.add("unread");
        readButton.textContent = "Mark as read";
        readButton.disabled = false;
        unmarkDailyBreadRead()
        console.log("User marked as unread!");
    }
});


const markReadMutation = `
mutation CreateDailyBreadUser($input: CreateDailyBreadUserInput!) {
    createDailyBreadUser(input: $input) {
      id
      userUsername
      dailyBreadDate
    }
  }
`;

async function markDailyBreadRead() {
    const userId = localStorage.getItem("guestUserId");
    const dailyBreadDate = AWSDateForDay(getCurrentDayIndex());
    const variables = {
        input: {
           userUsername: userId,
    dailyBreadDate: dailyBreadDate
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
                query: markReadMutation,
                variables
            })
        });

        const result = await response.json();
        if (result.errors) {
            console.error("Failed to mark read:", result.errors);
        } else {
            fetchDBReadStatus(getCurrentDayIndex())
            console.log("Marked as read:", result.data.createDailyBreadUser);
        }
    } catch (err) {
        console.error("Error marking read:", err);
    }
}

const deleteDailyBreadUserMutation = `
mutation DeleteDailyBreadUser($input: DeleteDailyBreadUserInput!) {
  deleteDailyBreadUser(input: $input) {
    id
    _version
  }
}
`;

export function unmarkDailyBreadRead() {
    const readButton = document.getElementById('read-button');
    const dailyBreadUserId = readButton.dataset.dailybreadUserId;
    const dailyBreadUserVersion = readButton.dataset.dailybreadUserVersion;
    if (!dailyBreadUserId) {
        console.warn("No DailyBreadUser ID found, cannot delete.");
        return;
    }

    const variables = {
        input: { id: dailyBreadUserId,
            _version: dailyBreadUserVersion}
    };

    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        },
        body: JSON.stringify({
            query: deleteDailyBreadUserMutation,
            variables
        })
    })
    .then(res => res.json())
    .then(result => {
        if (result.errors) {
            console.error("Failed to delete DailyBreadUser:", result.errors);
            return;
        }

        console.log("Deleted DailyBreadUser:", result.data.deleteDailyBreadUser);

        // Optionally update read count
        fetchDBReadStatus(getCurrentDayIndex());
    })
    .catch(err => {
        console.error("Error deleting DailyBreadUser:", err);
    });
}