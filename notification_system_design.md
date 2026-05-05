# Notification System Design


## Stage 1 — Notification API Design

### Supported Actions:

* Fetch notifications
* Mark notification as read
* Send notification

---

### 1. Get Notifications

GET /notifications?studentId=123

Response:

```json
{
  "notifications": [
    {
      "id": 1,
      "type": "Placement",
      "message": "You got selected!",
      "isRead": false,
      "createdAt": "2026-05-05T10:00:00Z"
    }
  ]
}
```

---

### 2. Mark as Read

PATCH /notifications/{id}/read

Response:

```json
{
  "message": "Notification marked as read"
}
```

---

### 3. Send Notification

POST /notifications

Request:

```json
{
  "studentId": 123,
  "type": "Placement",
  "message": "Congratulations!"
}
```

Response:

```json
{
  "message": "Notification sent successfully"
}
```

---

### Headers:

* Content-Type: application/json
* Authorization: Bearer token

---

### Real-Time Mechanism:

* WebSockets used for instant notification delivery

---

## Stage 2 — Database Design

### Database Choice:

PostgreSQL (reliable, supports indexing and scaling)

---

### Schema:

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  student_id INT,
  message TEXT,
  notification_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Problems with Scaling:

* Slow queries with large data
* Increased read/write latency

---

### Solutions:

* Indexing
* Partitioning
* Caching using Redis

---

## Stage 3 — Query Optimization

### Given Query:

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

---

### Issues:

* No index → Full table scan → Slow performance

---

### Optimized Index:

```sql
CREATE INDEX idx_notifications
ON notifications(studentID, isRead, createdAt);
```

---

### Why not index every column?

* Slows down insert/update operations
* Uses more memory

---

### Query: Students with Placement in Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

---

## Stage 4 — Performance Improvement

### Problem:

* Notifications fetched on every page load → DB overload

---

### Solutions:

* Pagination (LIMIT, OFFSET)
* Redis caching
* Lazy loading
* WebSockets for real-time updates

---

## Stage 5 — Scalable System Design

### Issues:

* Sequential processing
* No retry mechanism
* Slow performance

---

### Improved Approach:

* Use Queue System (Kafka / RabbitMQ)
* Async processing

---

### Improved Pseudocode:

```python
queue.publish(notification)

worker:
  save_to_db()
  send_email()
  push_notification()
```

---

## Stage 6 — Priority Notifications Code

```javascript
const priority = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getTopNotifications(notifications) {
  notifications.sort((a, b) => {
    if (priority[b.type] !== priority[a.type]) {
      return priority[b.type] - priority[a.type];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return notifications.slice(0, 10);
}
```

---
