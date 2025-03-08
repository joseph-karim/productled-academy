# Intentional Free Model Analyzer

A sophisticated tool for analyzing and optimizing product-led growth strategies, helping product teams design effective free models (freemium, free trial, open-core, community) based on user journeys and outcomes.

## Features

### AI-Powered Analysis
- **Product Description Analysis**: Get detailed feedback on product descriptions focusing on core value, features, uniqueness, and use cases
- **Challenge Identification**: AI-suggested solutions for user challenges
- **Model Selection**: Intelligent recommendations for the optimal free model
- **Feature Suggestions**: Strategic feature recommendations based on user journey

### User Journey Mapping
- Define outcomes across beginner, intermediate, and advanced levels
- Document and assess user challenges
- Track progression paths
- Measure success metrics

### Solution Framework
- Categorize solutions across:
  - Product features
  - Resources/tools
  - Content/guides
- Assess implementation cost and impact
- Balance quick wins with strategic investments

### DEEP Analysis Framework
- **Desirability**: User appeal and value proposition
- **Effectiveness**: Problem-solution fit
- **Efficiency**: Resource utilization
- **Polish**: User experience and cohesiveness

### Comprehensive Reporting
- Visual analytics with Chart.js
- Component-specific scoring
- Actionable recommendations
- Implementation timeline
- Testing framework

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage Guide

### 1. Product Description
- Enter your product description
- Get AI feedback on clarity and completeness
- Refine based on suggestions

### 2. User Endgame
- Define desired outcomes for each user level
- Specify transformation and value achieved
- Include measurable results

### 3. Challenges
- Document user challenges by experience level
- Rate challenge magnitude
- Get AI-suggested solutions

### 4. Solutions
- Propose solutions for each challenge
- Categorize by type (product/resource/content)
- Assess implementation cost

### 5. Model Selection
- Review AI-suggested free model
- Understand confidence score and reasoning
- Consider key factors for each model type

### 6. Free Features
- Design free tier feature set
- Balance value demonstration with upgrade triggers
- Optimize for quick wins

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenAI GPT-4
- **Data Visualization**: Chart.js
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/         # React components
│   ├── shared/        # Reusable UI components
│   └── steps/         # Form step components
├── services/          # API and business logic
│   └── ai.ts         # OpenAI integration
├── store/             # State management
│   └── formStore.ts  # Zustand store
└── types/             # TypeScript definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
