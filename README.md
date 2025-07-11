﻿# To-Do List Web Application

A full-stack to-do list web application built with Node.js, TypeScript, and vanilla HTML/CSS/JavaScript. This application supports multiple task lists with complete CRUD operations, following clean code architecture principles.

## 🚀 Features

### Core Functionality
- **Multiple Task Lists**: Create, edit, and delete separate task lists (e.g., Work, Personal, Shopping)
- **Task Management**: Add, edit, delete, and mark tasks as completed within each list
- **Persistent Storage**: JSON file-based storage for data persistence
- **Real-time Statistics**: Track completion rates and task counts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Technical Features
- **Clean Architecture**: Modular separation of concerns with proper layering
- **TypeScript Backend**: Fully typed Node.js backend with Express
- **Vanilla Frontend**: No framework dependencies, pure HTML/CSS/JavaScript
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Input Validation**: Server-side and client-side validation
- **RESTful API**: Well-structured REST endpoints
- **Accessibility**: ARIA labels and keyboard navigation support

## 🏗️ Architecture

### Project Structure
```
To-Do_App/
├── src/                          # Backend source code
│   ├── routes/                   # Express route handlers
│   │   ├── listRoutes.ts        # Task list endpoints
│   │   └── taskRoutes.ts        # Task endpoints
│   ├── controllers/              # Request processing logic
│   │   ├── listController.ts    # List operations
│   │   └── taskController.ts    # Task operations
│   ├── services/                 # Business logic layer
│   │   ├── listService.ts       # List business logic
│   │   └── taskService.ts       # Task business logic
│   ├── models/                   # TypeScript interfaces
│   │   ├── Task.ts              # Task model
│   │   └── TaskList.ts          # TaskList model
│   ├── utils/                    # Helper functions
│   │   ├── validation.ts        # Input validation
│   │   ├── logger.ts            # Logging utilities
│   │   └── fileStorage.ts       # File operations
│   ├── config/                   # Configuration
│   │   ├── cors.ts              # CORS setup
│   │   └── database.ts          # Storage initialization
│   └── middleware/               # Express middleware
│       └── errorHandler.ts      # Error handling
├── public/                       # Frontend files
│   ├── styles/                   # CSS files
│   │   ├── main.css             # Global styles
│   │   └── components.css       # Component styles
│   ├── scripts/                  # JavaScript files
│   │   ├── api.js               # API communication
│   │   ├── ui.js                # UI utilities
│   │   └── app.js               # Main application
│   └── index.html               # Main HTML file
├── data/                         # JSON storage (auto-created)
├── app.ts                        # Express server entry point
├── package.json                  # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

### Design Patterns
- **MVC Pattern**: Clear separation between Models, Views, and Controllers
- **Service Layer**: Business logic abstracted into service classes
- **Repository Pattern**: Data access abstracted through storage utilities
- **Middleware Pattern**: Express middleware for cross-cutting concerns
- **Module Pattern**: Frontend organized into reusable modules

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment
- **TypeScript**: Type-safe JavaScript
- **Express.js**: Web framework
- **JSON File Storage**: Simple, file-based persistence

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies
- **Fetch API**: HTTP client for API communication

### Development Tools
- **TypeScript Compiler**: Type checking and compilation
- **Node.js**: Development server
- **NPM**: Package management

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Steps

1. **Clone or download the project**
   ```bash
   cd To-Do_App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the TypeScript code**
   ```bash
   npm run build
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚀 Usage

### Getting Started
1. **Create Your First List**: Click "Create Your First List" or the "New List" button
2. **Add Tasks**: Enter task details in the form and click "Add Task"
3. **Manage Tasks**: 
   - Click the checkbox to mark tasks as complete
   - Use the edit button (✏️) to modify task details
   - Use the delete button (🗑️) to remove tasks
4. **Switch Lists**: Click on any list in the sidebar to switch between lists
5. **Manage Lists**: Use the edit and delete buttons in the list header or sidebar

### API Endpoints

#### Task Lists
- `GET /api/lists` - Get all task lists
- `POST /api/lists` - Create a new task list
- `GET /api/lists/:id` - Get a specific task list
- `PUT /api/lists/:id` - Update a task list
- `DELETE /api/lists/:id` - Delete a task list
- `GET /api/lists/:id/stats` - Get task list statistics

#### Tasks
- `GET /api/lists/:listId/tasks` - Get tasks for a specific list
- `POST /api/lists/:listId/tasks` - Create a task in a specific list
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `GET /api/tasks/search?q=query` - Search tasks
- `GET /api/tasks/stats` - Get task statistics

#### Health Checks
- `GET /api/health` - Application health check
- `GET /api/lists/health` - List service health check
- `GET /api/tasks/health` - Task service health check

## 🔧 Development

### Available Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Watch mode compilation
- `npm test` - Run tests (when implemented)

### Development Workflow
1. **Backend Changes**: Modify TypeScript files in `src/`
2. **Frontend Changes**: Modify files in `public/`
3. **Build**: Run `npm run build` to compile TypeScript
4. **Test**: Start the server with `npm start` and test in browser

### Code Style Guidelines
- **TypeScript**: Use strict typing, interfaces for data models
- **JavaScript**: ES6+ features, async/await for promises
- **CSS**: BEM methodology for class naming
- **HTML**: Semantic elements, accessibility attributes

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Modern blue and gray color scheme
- **Typography**: System fonts for optimal performance
- **Spacing**: Consistent spacing using CSS custom properties
- **Animations**: Smooth transitions and hover effects

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Tablet and desktop layouts
- **Touch-Friendly**: Large touch targets for mobile

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for high contrast mode
- **Focus Management**: Proper focus handling in modals

## 🔒 Security Features

- **Input Validation**: Server-side validation for all inputs
- **XSS Prevention**: HTML escaping for user content
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Secure error messages without sensitive data

## 📊 Performance

### Optimization Features
- **Minimal Dependencies**: Lightweight frontend with no frameworks
- **Efficient DOM Updates**: Targeted DOM manipulation
- **Lazy Loading**: Components loaded as needed
- **Caching**: Browser caching for static assets

### Monitoring
- **Health Checks**: Built-in health monitoring endpoints
- **Logging**: Comprehensive logging system
- **Error Tracking**: Detailed error reporting

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create, edit, and delete task lists
- [ ] Add, edit, delete, and toggle tasks
- [ ] Switch between different lists
- [ ] Test responsive design on different screen sizes
- [ ] Verify accessibility with keyboard navigation
- [ ] Test error handling with invalid inputs

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Get all lists
curl http://localhost:3000/api/lists

# Create a new list
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -d '{"name":"My New List"}'

# Health check
curl http://localhost:3000/api/health
```

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Set NODE_ENV=production
2. **Process Management**: Use PM2 or similar for process management
3. **Reverse Proxy**: Use Nginx for static file serving
4. **SSL/TLS**: Enable HTTPS in production
5. **Monitoring**: Set up application monitoring

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**TypeScript Compilation Errors**
```bash
# Clean build
rm -rf dist/
npm run build
```

**Data Not Persisting**
- Check if `data/` directory exists and is writable
- Verify file permissions
- Check server logs for storage errors

**Frontend Not Loading**
- Ensure `public/` directory contains all files
- Check browser console for JavaScript errors
- Verify API endpoints are responding

### Getting Help
- Check the browser console for error messages
- Review server logs for backend issues
- Verify all dependencies are installed
- Ensure Node.js version compatibility

## 🔮 Future Enhancements

### Planned Features
- [ ] User authentication and authorization
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time updates with WebSockets
- [ ] Task due dates and reminders
- [ ] Task categories and tags
- [ ] Export/import functionality
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) features
- [ ] Drag and drop task reordering
- [ ] Task search and filtering

### Technical Improvements
- [ ] Unit and integration tests
- [ ] API documentation with Swagger
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Automated backups
- [ ] Rate limiting
- [ ] API versioning

---

**Built using Node.js, TypeScript, and vanilla web technologies**
