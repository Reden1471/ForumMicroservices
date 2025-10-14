const API_BASE = 'https://localhost:7000/api/forum';
let currentToken = null;
let currentUser = null;
let currentUserId = null;

// UI manager
function showLogin() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
}

function showRegister() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('register-container').style.display = 'block';
    document.querySelector('.auth-container:first-child').style.display = 'none';
}

function showMainContent() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('user-info').style.display = 'flex';
}

// API calls
async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!username || !email || !password) {
        showMessage('Every field must be filled!', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Successful registration! Now you can login.', true);

            // Set back to login page
            setTimeout(() => {
                showLogin();
                // Emptying fields
                document.getElementById('reg-username').value = '';
                document.getElementById('reg-email').value = '';
                document.getElementById('reg-password').value = '';
            }, 2000);
        } else {
            showMessage(data || 'An error has occured while registering', false);
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, false);
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showMessage('Username and password requied!', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentToken = data.token;
            currentUser = data.username;
            currentUserId = getUserIdFromToken(data.token);

            document.getElementById('current-user').textContent = currentUser;
            showMainContent();
            loadPosts();
            showMessage('Successful login!', true);

            // Mezők ürítése
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            showMessage(data || 'Wrong username or password', false);
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, false);
    }
}

// Extract userID from token
function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

// Load posts
async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE}/posts`);
        if (!response.ok) throw new Error('An error has occured while loading posts');

        const posts = await response.json();
        await displayPosts(posts);

    } catch (error) {
        showMessage('An error has occured while loading posts: ' + error.message, false);
    }
}

// Display posts
async function displayPosts(posts) {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';

    if (posts.length === 0) {
        postsList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">There are no posts yet. Be the first!</p>';
        return;
    }

    for (const post of posts) {
        const postElement = await createPostElement(post);
        postsList.appendChild(postElement);
    }


    for (const post of posts) {
        await loadComments(post.id);
    }
}
// Retrieve multiple usernames at once - NEW FEATURE
async function getUsernames(userIds) {
    const usernameMap = {};
    const promises = userIds.map(async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/users/username/${userId}`);
            if (response.ok) {
                const username = await response.text();
                usernameMap[userId] = username;
            } else {
                usernameMap[userId] = `User${userId}`;
            }
        } catch (error) {
            console.error('Error fetching username:', error);
            usernameMap[userId] = `User${userId}`;
        }
    });

    await Promise.all(promises);
    return usernameMap;
}

// Create post element
async function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const isOwner = currentUserId === post.userId;
    const username = await getUsername(post.userId); 

    postDiv.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <div class="post-meta">
                By <strong>${escapeHtml(username)}</strong> |
                ${formatDate(post.createdAt)}
                ${post.updatedAt ? ` (edited: ${formatDate(post.updatedAt)})` : ''}
            </div>
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        
        ${isOwner ? `
            <div class="post-actions">
                <button onclick="editPost(${post.id}, '${escapeHtml(post.title)}', '${escapeHtml(post.content)}')" 
                        class="btn-small btn-edit">Edit</button>
                <button onclick="deletePost(${post.id})" 
                        class="btn-small btn-delete">Delete</button>
            </div>
        ` : ''}
        
        <div class="comments-section">
            <div class="comment-form">
                <input type="text" id="comment-input-${post.id}" placeholder="Write a comment..." class="comment-input">
                <button onclick="addComment(${post.id})" class="btn-small btn-comment">Send</button>
            </div>
            <div id="comments-${post.id}">
                <p style="color: #7f8c8d; font-style: italic;">Loading comments...</p>
            </div>
        </div>
    `;

    return postDiv;
}

// HTML escape fx
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load comments
async function loadComments(postId) {
    try {
        const response = await fetch(`${API_BASE}/comments/post/${postId}`);
        if (!response.ok) {
            throw new Error(`Failed to load comments for post ${postId}`);
        }

        const comments = await response.json();
        await displayComments(postId, comments);
    } catch (error) {
        console.error('An error has occured while loading comments:', error);
        const container = document.getElementById(`comments-${postId}`);
        if (container) {
            container.innerHTML = '<p style="color: #e74c3c;">Error loading comments</p>';
        }
    }
}

// Display comments
async function displayComments(postId, comments) {  // ← MÁR ASYNC
    const container = document.getElementById(`comments-${postId}`);
    if (!container) {
        console.error(`Comments container not found for post ${postId}`);
        return;
    }

    container.innerHTML = '';

    if (comments.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">There are no comments.</p>';
        return;
    }

    for (const comment of comments) {
        const username = await getUsername(comment.userId);
        const isOwner = currentUserId === comment.userId;

        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            <div class="comment-meta">
                By <strong>${escapeHtml(username)}</strong> | 
                ${formatDate(comment.createdAt)}
            </div>
            ${isOwner ? `
                <div class="comment-actions">
                    <button onclick="editComment(${comment.id}, '${escapeHtml(comment.content)}')" 
                            class="btn-small btn-edit">Edit</button>
                    <button onclick="deleteComment(${comment.id})" 
                            class="btn-small btn-delete">Delete</button>
                </div>
            ` : ''}
        `;
        container.appendChild(commentElement);
    }
}

// Create new post
async function createPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    if (!title || !content) {
        showMessage('Title and content requied!', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            loadPosts();
            showMessage('Post successfully created!', true);
        } else {
            const error = await response.text();
            showMessage('An error has occured while creating post: ' + error, false);
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, false);
    }
}

// Add comment
async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();

    if (!content) {
        showMessage('Write something to comment!', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                content: content,
                postId: postId
            })
        });

        if (response.ok) {
            input.value = '';
            loadPosts();
            showMessage('Comment has been successfully created!', true);
        } else {
            const error = await response.text();
            showMessage('An error has occured while creating comment: ' + error, false);
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, false);
    }
}

// Edit post
function editPost(postId, currentTitle, currentContent) {
    const newTitle = prompt('Post title:', currentTitle);
    if (newTitle === null) return;

    const newContent = prompt('Post content:', currentContent);
    if (newContent === null) return;

    updatePost(postId, newTitle, newContent);
}

//Update post

async function updatePost(postId, title, content) {
    try {
        const requestBody = {
            id: postId,
            title: title,
            content: content,
            userId: currentUserId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('=== UPDATE POST DEBUG ===');
        console.log('Request Body:', requestBody);

        const response = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response Status:', response.status);

        if (response.ok) {
            console.log('Update successful!');
            loadPosts();
            showMessage('Post updated!', true);
        } else {
            const errorText = await response.text();
            console.error('Error Response Text:', errorText);
            showMessage('An error has occured while updating post: ' + errorText, false);
        }

        console.log('=== UPDATE POST DEBUG END ===');
    } catch (error) {
        console.error('Network Error:', error);
        showMessage('Network error: ' + error.message, false);
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            loadPosts();
            showMessage('Post deleted successfully!', true);
        } else {
            const error = await response.text();
            showMessage('An error has occured while deleting post: ' + error, false);
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, false);
    }
}

// Logout
function logout() {
    currentToken = null;
    currentUser = null;
    currentUserId = null;
    showLogin();
    showMessage('Successful logout!', true);
}

// Show message
function showMessage(message, isSuccess) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${isSuccess ? 'success' : 'error'}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Page load
document.addEventListener('DOMContentLoaded', function () {
    showLogin();
});

// Username cache
let usernameCache = {};

// Get username
async function getUsername(userId) {
    if (usernameCache[userId]) {
        return usernameCache[userId];
    }

    try {
        const response = await fetch(`${API_BASE}/users/username/${userId}`);
        if (response.ok) {
            const username = await response.text();
            usernameCache[userId] = username;
            return username;
        }
    } catch (error) {
        console.error('Error fetching username:', error);
    }

    return `User${userId}`;
}

// Date format
function formatDate(dateString) {
    try {
        // If the date is empty or NULL
        if (!dateString || dateString === '0001-01-01T00:00:00') {
            return 'Unknown date';
        }

        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Unknown date';
        }

        return date.toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Date formatting error:', error, 'Input:', dateString);
        return 'Unknown Date';
    }
}

// Edit comment
function editComment(commentId, currentContent) {
    const newContent = prompt('Edit comment:', currentContent);
    if (newContent === null || newContent.trim() === '') return;

    updateComment(commentId, newContent.trim());
}

// Update comment
async function updateComment(commentId, content) {
    try {
        const response = await fetch(`${API_BASE}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                id: commentId,
                content: content
            })
        });

        if (response.ok) {
            loadPosts();
            showMessage('Comment updated!', true);
        } else {
            const error = await response.text();
            showMessage('An error has occured while updating comment: ' + error, false);
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, false);
    }
}

// Delete comment
async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            loadPosts();
            showMessage('Comment deleted successfully!', true);
        } else {
            const error = await response.text();
            showMessage('An error has occured while deleting comment: ' + error, false);
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, false);
    }
}