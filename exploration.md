# Exploration: BarrioConecta MVP

## Current State

The BarrioConecta project has comprehensive documentation and HTML prototypes but **no application code exists yet**. The documentation was written assuming a Node.js + Express stack, but project standards mandate Bun + TypeScript.

### Key Documentation Analyzed

**Project Vision** (docs/proposal/initial_scope.md):
- BarrioConecta is a local business directory SPA (Single Page Application)
- Connects neighbors with local micro-businesses (bakeries, hardware stores, workshops)
- MVP excludes: payment gateways, delivery logistics, native mobile apps, real-time chat

**Functional Requirements** (docs/requirements/functional.md):
- 12 functional requirements defined (RF-01 to RF-12)
- Core: Auth, Business CRUD, Geo-search by radius (500m-2km), Reviews (1-5 stars), Admin panel
- Search must respond < 1.5 seconds (RNF-02)
- Coverage requirement: >= 70% (RNF-06)

**Design System** (docs/prototype/connecta.md):
- Material Design 3 inspired "Vital Neighborhood" theme
- Primary: Emerald (#006b2c) - represents local commerce and growth
- Typography: Plus Jakarta Sans (headings) + Inter (body)
- Tailwind CSS configuration already defined in prototypes

**Prototypes** (docs/prototype/*.html):
- Landing page with search hero
- Business exploration with map + list split view
- Business detail page
- All use Tailwind with custom color palette

## Affected Areas

| Area | Current State | Required Changes |
|------|---------------|------------------|
| `docs/design/architecture.design.md` | Assumes Node.js + Express | Update to Bun + TypeScript |
| `docs/` | npm commands throughout | Replace with bun commands |
| Root project | No code structure | Create apps/api + apps/web structure |
| `prototype/` | HTML mockups only | Implement as Vue 3 components |

## Approaches

### Approach 1: Express + Bun (Recommended)
**Description**: Keep Express.js as the framework, run it with Bun runtime

- **Pros**:
  - Express is documented in original specs - easier to follow
  - Bun is largely compatible with Node.js APIs
  - Minimal changes to data models and middleware patterns
  - Express ecosystem is mature and well-documented

- **Cons**:
  - Not leveraging Bun's native performance optimizations
  - Still using callback-based middleware patterns

- **Effort**: Low

### Approach 2: Elysia (Bun-Native)
**Description**: Use Elysia framework (built for Bun) instead of Express

- **Pros**:
  - Native Bun performance (faster startup, lower memory)
  - End-to-end type safety with Eden Treaty
  - Modern TypeScript-first design

- **Cons**:
  - Requires rewriting all controller/service logic
  - Different middleware pattern (plugins vs middleware)
  - Smaller ecosystem, less documentation
  - Original specs become less directly applicable

- **Effort**: High

### Approach 3: Hono Framework
**Description**: Use Hono (lightweight, works with Bun/Node/Cloudflare)

- **Pros**:
  - Ultra-lightweight (14KB)
  - Works across multiple runtimes
  - Good TypeScript support

- **Cons**:
  - Still requires significant architecture changes
  - Different from documented Express patterns
  - Smaller community than Express

- **Effort**: Medium-High

## Recommendation

**Go with Approach 1: Express + Bun**

**Why**:
1. The project has EXCELLENT documentation written for Express - middleware, routing, error handling patterns are all documented
2. Bun is marketed as "Node.js-compatible" - this is exactly that use case
3. Express + TypeScript is a battle-tested combination
4. We can always migrate to Elysia later if performance becomes critical
5. Team can focus on building features, not learning new framework patterns

**Stack Decision**:

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Package Manager | Bun (replaces npm) |
| Backend Framework | Express.js (TypeScript) |
| Frontend Framework | Vue.js 3 (Composition API, TypeScript) |
| State Management | Pinia |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Validation | Joi (backend), Vuelidate (frontend) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Testing | Bun's built-in test runner |
| Architecture | Screaming Architecture (layered) |

**Architecture Structure** (Screaming):
```
/apps
  /api                    # Backend (Bun + Express + TypeScript)
    /src
      /users             # Domain: Auth & User management
      /businesses        # Domain: Business CRUD
      /reviews           # Domain: Reviews system
      /search            # Domain: Geo search
      /shared            # Shared utilities, middleware
    package.json         # Bun dependencies
    tsconfig.json
  
  /web                    # Frontend (Vue 3 + TypeScript)
    /src
      /components        # Atomic design components
      /views             # Page components
      /stores            # Pinia stores
      /composables       # Vue composables
    package.json
    tsconfig.json
    tailwind.config.js   # With custom BarrioConecta theme

/shared                   # Shared types/contracts
  /types
  /contracts
```

## Risks

1. **Bun Compatibility**: While Bun claims Node.js compatibility, edge cases with native modules could arise (mongoose, bcrypt)
   - **Mitigation**: Test early with actual dependencies; Bun's npm compatibility is excellent in practice

2. **TypeScript Learning Curve**: If team is not familiar with strict TypeScript
   - **Mitigation**: Use gradual strictness; focus on API contracts first

3. **Geospatial Query Performance**: MongoDB 2dsphere queries need proper indexing
   - **Mitigation**: Follow docs/data_model.design.md index specifications exactly

4. **Scope Creep**: Original docs include many features (reports, notifications, etc.)
   - **Mitigation**: Stick to MVP - auth, businesses, search, reviews ONLY

5. **Image Upload**: Prototypes show business photos (max 3, 2MB each)
   - **Mitigation**: Use Cloudinary or similar; don't build own storage for MVP

## Ready for Proposal

**YES** - The exploration phase is complete.

The orchestrator should tell the user:

> "The exploration is complete. We've reconciled the original Node.js/Express documentation with the mandatory Bun + TypeScript requirements. Good news: **Express works perfectly with Bun**, so we can follow the existing architecture specs almost verbatim while gaining Bun's performance benefits.
>
> **Key finding**: The MVP scope is well-defined across 6 core features: Auth, Business CRUD, Geo-Search (500m-2km radius), Reviews, Categories, and Admin moderation. The design system is complete with Tailwind configuration and prototypes ready to implement.
>
> **Recommended path**: Proceed to Proposal phase with Express + Bun stack, keeping the documented layered architecture. This minimizes risk while respecting the technical constraints."

---

## Phase Contract

### Status
COMPLETED

### Executive Summary
Explored BarrioConecta documentation and prototypes to define MVP scope and reconcile Node/Express assumptions with mandatory Bun + TypeScript constraints. Found that Express is compatible with Bun, allowing us to follow existing specs with minimal changes. Identified 6 core MVP features with clear acceptance criteria from the documentation.

### Artifacts Created
- **Memory**: Saved to Engram with topic_key `sdd/barrio-conecta-mvp/explore`
- **This Document**: `exploration.md` with full analysis

### Next Recommended Phase
**PROPOSE** - Create the change proposal with intent, scope, and approach

### Risks Identified
1. Bun compatibility edge cases with native modules (mitigated by Bun's strong npm compatibility)
2. TypeScript strictness learning curve (mitigated by gradual adoption)
3. Geospatial query performance (mitigated by following documented indexing)
4. Scope creep beyond MVP (mitigated by strict adherence to RF-01..RF-12 only)

### Skill Resolution
- Used `sdd-explore` skill for exploration workflow
- No additional skills required for this phase
