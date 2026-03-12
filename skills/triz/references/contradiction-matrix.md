# TRIZ Contradiction Matrix — Quick Reference

## 39 Engineering Parameters

| # | Parameter | Description |
|---|-----------|-------------|
| 1 | Weight of moving object | Mass in motion |
| 2 | Weight of stationary object | Mass at rest |
| 3 | Length of moving object | Linear dimension in motion |
| 4 | Length of stationary object | Linear dimension at rest |
| 5 | Area of moving object | Surface area in motion |
| 6 | Area of stationary object | Surface area at rest |
| 7 | Volume of moving object | Volume in motion |
| 8 | Volume of stationary object | Volume at rest |
| 9 | Speed | Velocity of an object |
| 10 | Force | Interaction intensity |
| 11 | Stress or pressure | Force per unit area |
| 12 | Shape | External contour |
| 13 | Stability of object's composition | Integrity, chemical stability |
| 14 | Strength | Resistance to breaking |
| 15 | Duration of action of moving object | Service life in motion |
| 16 | Duration of action of stationary object | Service life at rest |
| 17 | Temperature | Thermal condition |
| 18 | Illumination intensity | Light flux per area |
| 19 | Use of energy by moving object | Energy consumed in motion |
| 20 | Use of energy by stationary object | Energy consumed at rest |
| 21 | Power | Work per unit time |
| 22 | Loss of energy | Wasted energy |
| 23 | Loss of substance | Wasted material |
| 24 | Loss of information | Data loss or noise |
| 25 | Loss of time | Wasted time |
| 26 | Quantity of substance | Amount of material |
| 27 | Reliability | Probability of performing function |
| 28 | Measurement accuracy | Precision of measurement |
| 29 | Manufacturing precision | Precision of production |
| 30 | Object-affected harmful factors | External harmful effects on object |
| 31 | Object-generated harmful factors | Harmful effects produced by object |
| 32 | Ease of manufacture | Simplicity of production |
| 33 | Ease of operation | Convenience of use |
| 34 | Ease of repair | Simplicity of maintenance |
| 35 | Adaptability or versatility | Ability to adjust to changes |
| 36 | Device complexity | Number of elements and interactions |
| 37 | Difficulty of detecting and measuring | Observability |
| 38 | Extent of automation | Degree of self-operation |
| 39 | Productivity | Output per unit time |

## How to Use the Matrix

1. **Identify the improving parameter** — what you want to make better
2. **Identify the worsening parameter** — what degrades as a result
3. **Look up the intersection** — the matrix suggests 2-4 inventive principles

## Most Common Contradictions and Suggested Principles

The full 39×39 matrix is too large for inline reference. Below are the most frequently encountered contradictions in practice.

### Speed (9) vs...
| Worsening | Suggested Principles |
|-----------|---------------------|
| Force (10) | 13, 28, 15, 19 |
| Stress (11) | 6, 35, 36 |
| Stability (13) | 21, 35, 2, 39 |
| Strength (14) | 8, 3, 26, 14 |
| Loss of energy (22) | 19, 38, 7 |
| Reliability (27) | 21, 35, 11, 28 |

### Strength (14) vs...
| Worsening | Suggested Principles |
|-----------|---------------------|
| Weight of moving (1) | 1, 8, 40, 15 |
| Weight of stationary (2) | 40, 26, 27, 1 |
| Length of moving (3) | 8, 35, 29, 34 |
| Ease of manufacture (32) | 1, 35, 11, 10 |
| Ease of operation (33) | 2, 25, 28, 39 |

### Reliability (27) vs...
| Worsening | Suggested Principles |
|-----------|---------------------|
| Weight (1) | 3, 8, 10, 40 |
| Device complexity (36) | 1, 35, 13, 11 |
| Ease of repair (34) | 1, 11, 10, 35 |
| Productivity (39) | 10, 30, 4 |
| Loss of time (25) | 10, 30, 4, 35 |

### Productivity (39) vs...
| Worsening | Suggested Principles |
|-----------|---------------------|
| Reliability (27) | 35, 22, 18, 39 |
| Loss of energy (22) | 28, 10, 29, 35 |
| Device complexity (36) | 35, 18, 27, 2 |
| Ease of operation (33) | 35, 28, 2, 24 |
| Loss of substance (23) | 35, 18, 10, 39 |

### Device complexity (36) vs...
| Worsening | Suggested Principles |
|-----------|---------------------|
| Ease of operation (33) | 2, 26, 35, 39 |
| Reliability (27) | 1, 35, 13, 11 |
| Ease of manufacture (32) | 26, 2, 18, 35 |
| Adaptability (35) | 15, 1, 28 |

## Software & Knowledge Work Adaptations

The original 39 parameters are for physical engineering. For software/knowledge work, useful mappings:

| Software Concern | Maps to Parameter |
|-----------------|-------------------|
| Response time / latency | Speed (9) |
| Memory / storage usage | Volume (7, 8) |
| CPU / compute cost | Use of energy (19, 20) |
| Code complexity | Device complexity (36) |
| Maintainability | Ease of repair (34) |
| Usability | Ease of operation (33) |
| Throughput | Productivity (39) |
| Data integrity | Reliability (27) |
| Security | Stability of composition (13) |
| Accuracy | Measurement accuracy (28) |
| Development speed | Loss of time (25) |
| Scalability | Adaptability (35) |

## When the Matrix Doesn't Help

If no principles seem relevant:
1. Re-examine: are you framing the right contradiction?
2. Try reformulating as a physical contradiction and use separation principles
3. Look at the problem from the supersystem level
4. Consider: is there an unused resource that eliminates the contradiction entirely?
