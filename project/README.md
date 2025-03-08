# Intentional Free Model Analyzer

A sophisticated tool for analyzing and optimizing product-led growth strategies, helping product teams design effective free models (freemium, free trial, open-core, community) based on user journeys and outcomes.

## Features

- **Product Description Analysis**: AI-powered feedback on product descriptions with focus on core value, features, uniqueness, and use cases
- **User Journey Mapping**: Define and analyze user outcomes across beginner, intermediate, and advanced levels
- **Challenge Identification**: Document and assess user challenges with AI-suggested solutions
- **Solution Framework**: Categorize solutions across product features, resources, and content
- **Model Selection**: AI-assisted selection of the optimal free model based on comprehensive analysis
- **Free Feature Design**: Strategic feature selection based on beginner user journey
- **DEEP Analysis**: Comprehensive scoring using the DEEP framework (Desirability, Effectiveness, Efficiency, Polish)

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- OpenAI GPT-4 for AI analysis
- Chart.js for data visualization
- Lucide React for icons
- Zustand for state management

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/joseph-karim/intentional-free-model-analyzer.git
   ```

2. Install dependencies:
   ```bash
   cd intentional-free-model-analyzer
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/         # React components
│   ├── shared/        # Reusable components
│   └── steps/         # Form step components
├── services/          # API and business logic
├── store/             # State management
└── types/             # TypeScript type definitions
```

## Key Components

### Analysis Framework

The tool uses a comprehensive analysis framework:

1. **Product Description**
   - Core product definition
   - Key features and capabilities
   - Unique differentiators
   - Primary use cases

2. **User Journey**
   - Beginner outcomes
   - Intermediate progression
   - Advanced capabilities
   - Success metrics

3. **Challenge Assessment**
   - User pain points
   - Impact magnitude
   - Level-specific barriers
   - Solution opportunities

4. **Solution Categories**
   - Product features
   - Resources and tools
   - Content and guides
   - Implementation cost

5. **Model Selection**
   - Market fit analysis
   - User sophistication
   - Resource requirements
   - Growth potential

6. **Free Feature Strategy**
   - Core functionality
   - Value demonstration
   - Connection features
   - Educational resources

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.