import { AWSDateForDay, timeAgo} from "/daily/helpers.js";
import { getCurrentDayIndex } from "/daily/scrollbar.js";
const commentsDiv = document.getElementById("comments"); // New div for comments

const commentInput = document.getElementById("comment-input");
const commentSubmit = document.getElementById("comment-submit");
const commentNameInput = document.getElementById("comment-name");

// Load saved name from localStorage
const savedName = localStorage.getItem("commentName");
commentNameInput.value = savedName || "";


const endpoint = "https://gi4zexzfnfcbzbz6luibswx2bi.appsync-api.us-west-1.amazonaws.com/graphql";
const apiKey = "da2-kcdik2ri5zflzgicrd2mgaz2dm";

// GraphQL mutation for creating a comment
const createCommentMutation = `
  mutation CreateComment($input: CreateCommentsInput!) {
    createComments(input: $input) {
      id
      name
      text
      datetime
      username
    }
  }
`;

// Handle submit
commentSubmit.addEventListener("click", async () => {
    const text = commentInput.value.trim();
    if (!text) return alert("Please enter a comment.");

    // Example user info, replace with your guest user
    const username = localStorage.getItem("guestUserId") || "guest";
    let name = commentNameInput.value.trim()
    // Save name to localStorage
    localStorage.setItem("commentName", name);
    if (name === ""){
        name = 'Anonymous'
    }
    const dailyBreadDate = AWSDateForDay(getCurrentDayIndex());

    const variables = {
        input: {
            text,
            name,
            username,
            dailyBread: dailyBreadDate,
            datetime: new Date().toISOString()
        }
    };

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify({
                query: createCommentMutation,
                variables
            })
        });

        const result = await res.json();

        if (result.errors) {
            console.error("GraphQL errors:", result.errors);
            alert("Failed to post comment.");
        } else {
            const newComment = result.data.createComments;
            console.log("Comment created:", newComment);

            // Add comment to DOM at the top
            const commentHTML = `
                <div class="comment">
                    <p class="comment-text"><strong>${newComment.name}:</strong> ${newComment.text}</p>
                    <p class="comment-date">just now</p>
                </div>
            `;
            commentsDiv.insertAdjacentHTML("afterbegin", commentHTML);

            // Clear input
            commentInput.value = "";
        }
    } catch (err) {
        console.error("Error posting comment:", err);
        alert("Failed to post comment.");
    }
});
// Update timestamps periodically
function updateCommentTimestamps() {
    const commentElements = commentsDiv.querySelectorAll(".comment");
    commentElements.forEach(el => {
        const idx = el.dataset.idx;
        const c = currentComments[idx];
        const dateEl = el.querySelector(".comment-date");
        if (dateEl) {
            dateEl.textContent = timeAgo(c.datetime);
        }
    });
}



setInterval(updateCommentTimestamps, 60000);