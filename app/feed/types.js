// Memory object structure for the feed
// Orientation: "vertical" | "horizontal"
// Memory: object with id, userId, s3Url, thumbnailUrl, tags, caption, createdAt, width, height, orientation, likes, comments, processed
// Filters: object with tags, userId, date

export const uid = (prefix = "m") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

// Helper function to create a new memory object
export const createMemory = ({
  id,
  userId,
  s3Url,
  thumbnailUrl,
  tags = [],
  caption,
  createdAt,
  width,
  height,
  orientation,
  likes = 0,
  comments = 0,
  processed = false
}) => ({
  id,
  userId,
  s3Url,
  thumbnailUrl,
  tags,
  caption,
  createdAt,
  width,
  height,
  orientation,
  likes,
  comments,
  processed
});
