// Auto-generated from CSV data — do not edit manually

export const staticFleetData: any[] = [
  {
    "truck_id": 0,
    "gps": {
      "t": 1771970887,
      "truck_id": 0,
      "timestamp": "2026-02-24T22:08:07.878545+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 45.37,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 0,
      "timestamp": "2026-02-24T22:08:07.878632+00:00",
      "temperature_c": 69.41,
      "humidity_pct": "95.0",
      "door_open": false,
      "shipment_value": 58882.3,
      "remaining_slack_min": -191.01,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 0,
      "timestamp": "2026-02-24T21:54:16.911848+00:00",
      "recommended_action": "continue",
      "mean_cost": 16723.75,
      "all_actions": [
        {
          "action": "reroute",
          "next_node": 18,
          "edge_travel_time_min": "40.0",
          "extra_time_min": "0.0",
          "fixed_cost": "500.0",
          "mean_cost": 17516.93,
          "mean_cost_components": {
            "operating_travel": 389.26,
            "delay_service": 2377.47,
            "spoilage": 14250.2
          }
        },
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "64.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16723.75,
          "mean_cost_components": {
            "operating_travel": 382.7,
            "delay_service": 2339.92,
            "spoilage": 14001.13
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 16,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          18,
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 1,
    "gps": {
      "t": 1771970887,
      "truck_id": 1,
      "timestamp": "2026-02-24T22:08:07.878839+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 44.83,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 1,
      "timestamp": "2026-02-24T22:08:07.878857+00:00",
      "temperature_c": 40.4,
      "humidity_pct": 94.92,
      "door_open": false,
      "shipment_value": 108876.56,
      "remaining_slack_min": -92.39,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 1,
      "timestamp": "2026-02-24T21:53:59.528231+00:00",
      "recommended_action": "continue",
      "mean_cost": 12102.59,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12102.59,
          "mean_cost_components": {
            "operating_travel": 354.89,
            "delay_service": 2287.77,
            "spoilage": 9459.93
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 2,
    "gps": {
      "t": 1771970887,
      "truck_id": 2,
      "timestamp": "2026-02-24T22:08:07.878921+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 54.03,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 2,
      "timestamp": "2026-02-24T22:08:07.878935+00:00",
      "temperature_c": 101.23,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 94243.17,
      "remaining_slack_min": -215.08,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 2,
      "timestamp": "2026-02-24T21:54:25.599788+00:00",
      "recommended_action": "continue",
      "mean_cost": 16997.86,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16997.86,
          "mean_cost_components": {
            "operating_travel": 356.07,
            "delay_service": 2421.67,
            "spoilage": 14220.12
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 3,
    "gps": {
      "t": 1771970887,
      "truck_id": 3,
      "timestamp": "2026-02-24T22:08:07.879011+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 53.64,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 3,
      "timestamp": "2026-02-24T22:08:07.879026+00:00",
      "temperature_c": 112.23,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 69658.92,
      "remaining_slack_min": -215.32,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 3,
      "timestamp": "2026-02-24T21:54:25.599919+00:00",
      "recommended_action": "continue",
      "mean_cost": 12148.61,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12148.61,
          "mean_cost_components": {
            "operating_travel": 349.09,
            "delay_service": 2395.65,
            "spoilage": 9403.87
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 4,
    "gps": {
      "t": 1771970887,
      "truck_id": 4,
      "timestamp": "2026-02-24T22:08:07.879084+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 49.5,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 4,
      "timestamp": "2026-02-24T22:08:07.879097+00:00",
      "temperature_c": 95.97,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 114632.5,
      "remaining_slack_min": -279.27,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 4,
      "timestamp": "2026-02-24T21:55:00.407473+00:00",
      "recommended_action": "continue",
      "mean_cost": 16991.81,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "32.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16991.81,
          "mean_cost_components": {
            "operating_travel": 320.24,
            "delay_service": 2506.51,
            "spoilage": 14165.06
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 18,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 5,
    "gps": {
      "t": 1771970887,
      "truck_id": 5,
      "timestamp": "2026-02-24T22:08:07.879168+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 51.28,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 5,
      "timestamp": "2026-02-24T22:08:07.879182+00:00",
      "temperature_c": 40.45,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 34738.34,
      "remaining_slack_min": -261.76,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 5,
      "timestamp": "2026-02-24T21:54:25.600146+00:00",
      "recommended_action": "continue",
      "mean_cost": 12350.23,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12350.23,
          "mean_cost_components": {
            "operating_travel": 353.15,
            "delay_service": 2482.41,
            "spoilage": 9514.67
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 6,
    "gps": {
      "t": 1771970887,
      "truck_id": 6,
      "timestamp": "2026-02-24T22:08:07.879238+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 54.53,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 6,
      "timestamp": "2026-02-24T22:08:07.879252+00:00",
      "temperature_c": 86.69,
      "humidity_pct": 92.16,
      "door_open": false,
      "shipment_value": 56278.7,
      "remaining_slack_min": -255.12,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 6,
      "timestamp": "2026-02-24T21:54:16.912631+00:00",
      "recommended_action": "continue",
      "mean_cost": 16930.82,
      "all_actions": [
        {
          "action": "reroute",
          "next_node": 18,
          "edge_travel_time_min": "40.0",
          "extra_time_min": "0.0",
          "fixed_cost": "500.0",
          "mean_cost": 17368.09,
          "mean_cost_components": {
            "operating_travel": "385.0",
            "delay_service": 2424.03,
            "spoilage": 14059.07
          }
        },
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "64.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16930.82,
          "mean_cost_components": {
            "operating_travel": 384.01,
            "delay_service": 2430.6,
            "spoilage": 14116.2
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 16,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          18,
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 7,
    "gps": {
      "t": 1771970887,
      "truck_id": 7,
      "timestamp": "2026-02-24T22:08:07.879306+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": "51.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 7,
      "timestamp": "2026-02-24T22:08:07.879320+00:00",
      "temperature_c": 53.19,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 51695.68,
      "remaining_slack_min": -243.88,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 7,
      "timestamp": "2026-02-24T21:54:08.227963+00:00",
      "recommended_action": "continue",
      "mean_cost": 17136.19,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17136.19,
          "mean_cost_components": {
            "operating_travel": 343.76,
            "delay_service": 2467.08,
            "spoilage": 14325.34
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 8,
    "gps": {
      "t": 1771970887,
      "truck_id": 8,
      "timestamp": "2026-02-24T22:08:07.879394+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 45.56,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 8,
      "timestamp": "2026-02-24T22:08:07.879408+00:00",
      "temperature_c": 113.8,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 68665.38,
      "remaining_slack_min": -272.43,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 8,
      "timestamp": "2026-02-24T21:54:25.600470+00:00",
      "recommended_action": "continue",
      "mean_cost": 17082.85,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17082.85,
          "mean_cost_components": {
            "operating_travel": 349.2,
            "delay_service": 2488.48,
            "spoilage": 14245.17
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 9,
    "gps": {
      "t": 1771970887,
      "truck_id": 9,
      "timestamp": "2026-02-24T22:08:07.879464+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 55.1,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 9,
      "timestamp": "2026-02-24T22:08:07.879477+00:00",
      "temperature_c": 28.86,
      "humidity_pct": 93.4,
      "door_open": true,
      "shipment_value": 43519.08,
      "remaining_slack_min": -237.3,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 9,
      "timestamp": "2026-02-24T21:54:25.600572+00:00",
      "recommended_action": "continue",
      "mean_cost": 12479.43,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12479.43,
          "mean_cost_components": {
            "operating_travel": 357.8,
            "delay_service": 2482.12,
            "spoilage": 9639.51
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 10,
    "gps": {
      "t": 1771970887,
      "truck_id": 10,
      "timestamp": "2026-02-24T22:08:07.879555+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 44.89,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 10,
      "timestamp": "2026-02-24T22:08:07.879570+00:00",
      "temperature_c": 85.72,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 65247.94,
      "remaining_slack_min": -267.78,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 10,
      "timestamp": "2026-02-24T21:54:25.600689+00:00",
      "recommended_action": "continue",
      "mean_cost": 12131.19,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12131.19,
          "mean_cost_components": {
            "operating_travel": 347.29,
            "delay_service": 2441.48,
            "spoilage": 9342.42
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 11,
    "gps": {
      "t": 1771970887,
      "truck_id": 11,
      "timestamp": "2026-02-24T22:08:07.879625+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 47.75,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 11,
      "timestamp": "2026-02-24T22:08:07.879639+00:00",
      "temperature_c": 98.16,
      "humidity_pct": 90.37,
      "door_open": false,
      "shipment_value": 93914.92,
      "remaining_slack_min": -180.56,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 11,
      "timestamp": "2026-02-24T21:54:25.600793+00:00",
      "recommended_action": "continue",
      "mean_cost": 17068.94,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17068.94,
          "mean_cost_components": {
            "operating_travel": 349.85,
            "delay_service": 2393.85,
            "spoilage": 14325.25
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 12,
    "gps": {
      "t": 1771970887,
      "truck_id": 12,
      "timestamp": "2026-02-24T22:08:07.879694+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 54.03,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 12,
      "timestamp": "2026-02-24T22:08:07.879707+00:00",
      "temperature_c": 87.27,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 91253.74,
      "remaining_slack_min": -150.93,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 12,
      "timestamp": "2026-02-24T21:54:25.600893+00:00",
      "recommended_action": "continue",
      "mean_cost": 12247.62,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12247.62,
          "mean_cost_components": {
            "operating_travel": 355.13,
            "delay_service": 2366.32,
            "spoilage": 9526.16
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 13,
    "gps": {
      "t": 1771970887,
      "truck_id": 13,
      "timestamp": "2026-02-24T22:08:07.879759+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 46.58,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 13,
      "timestamp": "2026-02-24T22:08:07.879772+00:00",
      "temperature_c": 108.86,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 69420.97,
      "remaining_slack_min": -242.73,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 13,
      "timestamp": "2026-02-24T21:54:16.913362+00:00",
      "recommended_action": "continue",
      "mean_cost": 16975.47,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16975.47,
          "mean_cost_components": {
            "operating_travel": 332.66,
            "delay_service": 2448.77,
            "spoilage": 14194.04
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 14,
    "gps": {
      "t": 1771970887,
      "truck_id": 14,
      "timestamp": "2026-02-24T22:08:07.879827+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 53.03,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 14,
      "timestamp": "2026-02-24T22:08:07.879842+00:00",
      "temperature_c": 78.51,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 118413.18,
      "remaining_slack_min": -151.83,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 14,
      "timestamp": "2026-02-24T21:54:16.913433+00:00",
      "recommended_action": "continue",
      "mean_cost": 12247.87,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12247.87,
          "mean_cost_components": {
            "operating_travel": 351.58,
            "delay_service": 2371.73,
            "spoilage": 9524.56
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 15,
    "gps": {
      "t": 1771970887,
      "truck_id": 15,
      "timestamp": "2026-02-24T22:08:07.879896+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 51.23,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 15,
      "timestamp": "2026-02-24T22:08:07.879909+00:00",
      "temperature_c": 78.07,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 105571.01,
      "remaining_slack_min": -177.58,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 15,
      "timestamp": "2026-02-24T21:54:16.913878+00:00",
      "recommended_action": "continue",
      "mean_cost": 12285.02,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12285.02,
          "mean_cost_components": {
            "operating_travel": 360.58,
            "delay_service": 2391.2,
            "spoilage": 9533.24
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 16,
    "gps": {
      "t": 1771970887,
      "truck_id": 16,
      "timestamp": "2026-02-24T22:08:07.879963+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 48.9,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 16,
      "timestamp": "2026-02-24T22:08:07.879976+00:00",
      "temperature_c": 98.4,
      "humidity_pct": 94.37,
      "door_open": false,
      "shipment_value": 51592.35,
      "remaining_slack_min": -251.45,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 16,
      "timestamp": "2026-02-24T21:54:16.913956+00:00",
      "recommended_action": "continue",
      "mean_cost": 17248.27,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17248.27,
          "mean_cost_components": {
            "operating_travel": 353.13,
            "delay_service": 2489.38,
            "spoilage": 14405.76
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 17,
    "gps": {
      "t": 1771970887,
      "truck_id": 17,
      "timestamp": "2026-02-24T22:08:07.880029+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 51.67,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 17,
      "timestamp": "2026-02-24T22:08:07.880042+00:00",
      "temperature_c": 66.98,
      "humidity_pct": 92.67,
      "door_open": false,
      "shipment_value": 64178.51,
      "remaining_slack_min": -147.3,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 17,
      "timestamp": "2026-02-24T21:54:25.601389+00:00",
      "recommended_action": "continue",
      "mean_cost": 12219.58,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12219.58,
          "mean_cost_components": {
            "operating_travel": 345.92,
            "delay_service": 2357.79,
            "spoilage": 9515.87
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 18,
    "gps": {
      "t": 1771970887,
      "truck_id": 18,
      "timestamp": "2026-02-24T22:08:07.880110+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 44.16,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 18,
      "timestamp": "2026-02-24T22:08:07.880125+00:00",
      "temperature_c": 115.87,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 50540.5,
      "remaining_slack_min": -224.51,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 18,
      "timestamp": "2026-02-24T21:55:00.408952+00:00",
      "recommended_action": "continue",
      "mean_cost": 16951.29,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "32.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16951.29,
          "mean_cost_components": {
            "operating_travel": 311.62,
            "delay_service": 2434.75,
            "spoilage": 14204.93
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 18,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 19,
    "gps": {
      "t": 1771970887,
      "truck_id": 19,
      "timestamp": "2026-02-24T22:08:07.880179+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 53.28,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 19,
      "timestamp": "2026-02-24T22:08:07.880193+00:00",
      "temperature_c": 85.54,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 30112.01,
      "remaining_slack_min": -149.47,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 19,
      "timestamp": "2026-02-24T21:54:16.914200+00:00",
      "recommended_action": "continue",
      "mean_cost": 17202.09,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17202.09,
          "mean_cost_components": {
            "operating_travel": 357.52,
            "delay_service": 2387.03,
            "spoilage": 14457.54
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 20,
    "gps": {
      "t": 1771970887,
      "truck_id": 20,
      "timestamp": "2026-02-24T22:08:07.880246+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 55.61,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 20,
      "timestamp": "2026-02-24T22:08:07.880259+00:00",
      "temperature_c": 58.23,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 59546.38,
      "remaining_slack_min": -239.47,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 20,
      "timestamp": "2026-02-24T21:54:25.601706+00:00",
      "recommended_action": "continue",
      "mean_cost": 17168.05,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17168.05,
          "mean_cost_components": {
            "operating_travel": 345.41,
            "delay_service": 2469.2,
            "spoilage": 14353.44
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 21,
    "gps": {
      "t": 1771970887,
      "truck_id": 21,
      "timestamp": "2026-02-24T22:08:07.880312+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 45.91,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 21,
      "timestamp": "2026-02-24T22:08:07.880326+00:00",
      "temperature_c": 40.33,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 42609.88,
      "remaining_slack_min": -191.28,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 21,
      "timestamp": "2026-02-24T21:54:16.914307+00:00",
      "recommended_action": "continue",
      "mean_cost": 12220.09,
      "all_actions": [
        {
          "action": "reroute",
          "next_node": 18,
          "edge_travel_time_min": "40.0",
          "extra_time_min": "0.0",
          "fixed_cost": "500.0",
          "mean_cost": 12564.08,
          "mean_cost_components": {
            "operating_travel": 396.78,
            "delay_service": 2348.62,
            "spoilage": 9318.69
          }
        },
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "64.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12220.09,
          "mean_cost_components": {
            "operating_travel": 391.09,
            "delay_service": 2369.16,
            "spoilage": 9459.83
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 16,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          18,
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 22,
    "gps": {
      "t": 1771970887,
      "truck_id": 22,
      "timestamp": "2026-02-24T22:08:07.880378+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 46.1,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 22,
      "timestamp": "2026-02-24T22:08:07.880392+00:00",
      "temperature_c": 66.45,
      "humidity_pct": 94.28,
      "door_open": false,
      "shipment_value": 82436.64,
      "remaining_slack_min": -70.2,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 22,
      "timestamp": "2026-02-24T21:53:50.738184+00:00",
      "recommended_action": "continue",
      "mean_cost": 12151.55,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12151.55,
          "mean_cost_components": {
            "operating_travel": 339.13,
            "delay_service": 2277.96,
            "spoilage": 9534.45
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 23,
    "gps": {
      "t": 1771970887,
      "truck_id": 23,
      "timestamp": "2026-02-24T22:08:07.880445+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 49.88,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 23,
      "timestamp": "2026-02-24T22:08:07.880458+00:00",
      "temperature_c": 74.65,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 98872.29,
      "remaining_slack_min": -230.45,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 23,
      "timestamp": "2026-02-24T21:54:16.914412+00:00",
      "recommended_action": "continue",
      "mean_cost": 17167.24,
      "all_actions": [
        {
          "action": "reroute",
          "next_node": 18,
          "edge_travel_time_min": "40.0",
          "extra_time_min": "0.0",
          "fixed_cost": "500.0",
          "mean_cost": 17645.67,
          "mean_cost_components": {
            "operating_travel": 400.47,
            "delay_service": 2430.13,
            "spoilage": 14315.07
          }
        },
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "64.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17167.24,
          "mean_cost_components": {
            "operating_travel": 378.29,
            "delay_service": 2444.74,
            "spoilage": 14344.21
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 16,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          18,
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 24,
    "gps": {
      "t": 1771970887,
      "truck_id": 24,
      "timestamp": "2026-02-24T22:08:07.880511+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 51.88,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 24,
      "timestamp": "2026-02-24T22:08:07.880524+00:00",
      "temperature_c": 58.83,
      "humidity_pct": 93.09,
      "door_open": false,
      "shipment_value": 114009.57,
      "remaining_slack_min": -149.93,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 24,
      "timestamp": "2026-02-24T21:53:59.529521+00:00",
      "recommended_action": "continue",
      "mean_cost": 12094.73,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12094.73,
          "mean_cost_components": {
            "operating_travel": 363.26,
            "delay_service": 2333.07,
            "spoilage": 9398.4
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 25,
    "gps": {
      "t": 1771970887,
      "truck_id": 25,
      "timestamp": "2026-02-24T22:08:07.880577+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 47.3,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 25,
      "timestamp": "2026-02-24T22:08:07.880590+00:00",
      "temperature_c": 81.04,
      "humidity_pct": 94.88,
      "door_open": false,
      "shipment_value": 47630.64,
      "remaining_slack_min": -195.86,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 25,
      "timestamp": "2026-02-24T21:54:25.602197+00:00",
      "recommended_action": "continue",
      "mean_cost": 17031.03,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17031.03,
          "mean_cost_components": {
            "operating_travel": 354.86,
            "delay_service": 2404.16,
            "spoilage": 14272.01
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 26,
    "gps": {
      "t": 1771970887,
      "truck_id": 26,
      "timestamp": "2026-02-24T22:08:07.880643+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 53.52,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 26,
      "timestamp": "2026-02-24T22:08:07.880656+00:00",
      "temperature_c": 40.47,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 111164.22,
      "remaining_slack_min": -245.33,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 26,
      "timestamp": "2026-02-24T21:54:16.914576+00:00",
      "recommended_action": "continue",
      "mean_cost": 12384.9,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12384.9,
          "mean_cost_components": {
            "operating_travel": 351.13,
            "delay_service": 2469.81,
            "spoilage": 9563.96
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 27,
    "gps": {
      "t": 1771970887,
      "truck_id": 27,
      "timestamp": "2026-02-24T22:08:07.880709+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 47.87,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 27,
      "timestamp": "2026-02-24T22:08:07.880723+00:00",
      "temperature_c": 87.44,
      "humidity_pct": "95.0",
      "door_open": false,
      "shipment_value": 109242.76,
      "remaining_slack_min": -179.14,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": null
  },
  {
    "truck_id": 28,
    "gps": {
      "t": 1771970887,
      "truck_id": 28,
      "timestamp": "2026-02-24T22:08:07.880775+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 52.03,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 28,
      "timestamp": "2026-02-24T22:08:07.880788+00:00",
      "temperature_c": 52.34,
      "humidity_pct": 91.38,
      "door_open": false,
      "shipment_value": 101684.47,
      "remaining_slack_min": -176.61,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 28,
      "timestamp": "2026-02-24T21:54:16.915887+00:00",
      "recommended_action": "continue",
      "mean_cost": 12197.82,
      "all_actions": [
        {
          "action": "reroute",
          "next_node": 18,
          "edge_travel_time_min": "40.0",
          "extra_time_min": "0.0",
          "fixed_cost": "500.0",
          "mean_cost": 12723.56,
          "mean_cost_components": {
            "operating_travel": 381.76,
            "delay_service": 2358.82,
            "spoilage": 9482.98
          }
        },
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "64.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12197.82,
          "mean_cost_components": {
            "operating_travel": 375.19,
            "delay_service": 2351.87,
            "spoilage": 9470.77
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 16,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          18,
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 29,
    "gps": {
      "t": 1771970887,
      "truck_id": 29,
      "timestamp": "2026-02-24T22:08:07.880866+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 45.49,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 29,
      "timestamp": "2026-02-24T22:08:07.880882+00:00",
      "temperature_c": 65.51,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 80297.18,
      "remaining_slack_min": -271.5,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 29,
      "timestamp": "2026-02-24T21:55:00.410031+00:00",
      "recommended_action": "continue",
      "mean_cost": 17102.85,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "32.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17102.85,
          "mean_cost_components": {
            "operating_travel": 317.67,
            "delay_service": 2496.98,
            "spoilage": 14288.2
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 18,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 30,
    "gps": {
      "t": 1771970887,
      "truck_id": 30,
      "timestamp": "2026-02-24T22:08:07.880938+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 46.23,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 30,
      "timestamp": "2026-02-24T22:08:07.880952+00:00",
      "temperature_c": 43.19,
      "humidity_pct": 94.22,
      "door_open": false,
      "shipment_value": 55848.35,
      "remaining_slack_min": -254.15,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 30,
      "timestamp": "2026-02-24T21:54:25.602683+00:00",
      "recommended_action": "continue",
      "mean_cost": 12493.34,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12493.34,
          "mean_cost_components": {
            "operating_travel": 358.55,
            "delay_service": 2495.51,
            "spoilage": 9639.28
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 31,
    "gps": {
      "t": 1771970887,
      "truck_id": 31,
      "timestamp": "2026-02-24T22:08:07.881005+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 55.38,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 31,
      "timestamp": "2026-02-24T22:08:07.881018+00:00",
      "temperature_c": 69.07,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 81592.51,
      "remaining_slack_min": -71.37,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 31,
      "timestamp": "2026-02-24T21:53:42.034849+00:00",
      "recommended_action": "continue",
      "mean_cost": 12066.18,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12066.18,
          "mean_cost_components": {
            "operating_travel": 352.49,
            "delay_service": 2261.5,
            "spoilage": 9452.19
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 32,
    "gps": {
      "t": 1771970887,
      "truck_id": 32,
      "timestamp": "2026-02-24T22:08:07.881071+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 44.75,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 32,
      "timestamp": "2026-02-24T22:08:07.881084+00:00",
      "temperature_c": 80.25,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 55055.24,
      "remaining_slack_min": -183.52,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 32,
      "timestamp": "2026-02-24T21:54:25.602882+00:00",
      "recommended_action": "continue",
      "mean_cost": 17032.6,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17032.6,
          "mean_cost_components": {
            "operating_travel": 354.42,
            "delay_service": 2390.15,
            "spoilage": 14288.02
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 33,
    "gps": {
      "t": 1771970887,
      "truck_id": 33,
      "timestamp": "2026-02-24T22:08:07.881136+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": "48.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 33,
      "timestamp": "2026-02-24T22:08:07.881149+00:00",
      "temperature_c": 63.42,
      "humidity_pct": 94.21,
      "door_open": false,
      "shipment_value": 115780.79,
      "remaining_slack_min": -243.53,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 33,
      "timestamp": "2026-02-24T21:53:59.529967+00:00",
      "recommended_action": "continue",
      "mean_cost": 17090.73,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17090.73,
          "mean_cost_components": {
            "operating_travel": 349.03,
            "delay_service": 2458.49,
            "spoilage": 14283.21
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 34,
    "gps": {
      "t": 1771970887,
      "truck_id": 34,
      "timestamp": "2026-02-24T22:08:07.881201+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 47.54,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 34,
      "timestamp": "2026-02-24T22:08:07.881214+00:00",
      "temperature_c": 60.59,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 86319.67,
      "remaining_slack_min": -119.64,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 34,
      "timestamp": "2026-02-24T21:54:25.603077+00:00",
      "recommended_action": "continue",
      "mean_cost": 12176.63,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12176.63,
          "mean_cost_components": {
            "operating_travel": 363.59,
            "delay_service": 2320.77,
            "spoilage": 9492.27
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 35,
    "gps": {
      "t": 1771970887,
      "truck_id": 35,
      "timestamp": "2026-02-24T22:08:07.881266+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 47.04,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 35,
      "timestamp": "2026-02-24T22:08:07.881279+00:00",
      "temperature_c": 67.51,
      "humidity_pct": 89.18,
      "door_open": false,
      "shipment_value": 96292.95,
      "remaining_slack_min": -263.49,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 35,
      "timestamp": "2026-02-24T21:54:16.916496+00:00",
      "recommended_action": "continue",
      "mean_cost": 17087.21,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17087.21,
          "mean_cost_components": {
            "operating_travel": 344.31,
            "delay_service": 2482.16,
            "spoilage": 14260.74
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 36,
    "gps": {
      "t": 1771970887,
      "truck_id": 36,
      "timestamp": "2026-02-24T22:08:07.881331+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 48.98,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 36,
      "timestamp": "2026-02-24T22:08:07.881344+00:00",
      "temperature_c": 127.89,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 64244.94,
      "remaining_slack_min": -216.86,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "64.0",
      "edge_progress_frac": "0.0"
    },
    "decision": null
  },
  {
    "truck_id": 37,
    "gps": {
      "t": 1771970887,
      "truck_id": 37,
      "timestamp": "2026-02-24T22:08:07.881397+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 48.62,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 37,
      "timestamp": "2026-02-24T22:08:07.881410+00:00",
      "temperature_c": 81.97,
      "humidity_pct": 87.82,
      "door_open": false,
      "shipment_value": 64345.33,
      "remaining_slack_min": -239.06,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 37,
      "timestamp": "2026-02-24T21:53:59.530191+00:00",
      "recommended_action": "continue",
      "mean_cost": 12394.92,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12394.92,
          "mean_cost_components": {
            "operating_travel": 339.62,
            "delay_service": 2471.02,
            "spoilage": 9584.28
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 38,
    "gps": {
      "t": 1771970887,
      "truck_id": 38,
      "timestamp": "2026-02-24T22:08:07.881463+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 44.19,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 38,
      "timestamp": "2026-02-24T22:08:07.881476+00:00",
      "temperature_c": 133.45,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 55971.08,
      "remaining_slack_min": -160.48,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 38,
      "timestamp": "2026-02-24T21:54:25.603468+00:00",
      "recommended_action": "continue",
      "mean_cost": "17180.0",
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": "17180.0",
          "mean_cost_components": {
            "operating_travel": 353.41,
            "delay_service": 2393.63,
            "spoilage": 14432.97
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 39,
    "gps": {
      "t": 1771970887,
      "truck_id": 39,
      "timestamp": "2026-02-24T22:08:07.881528+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 54.88,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 39,
      "timestamp": "2026-02-24T22:08:07.881541+00:00",
      "temperature_c": 63.45,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 55561.32,
      "remaining_slack_min": -112.84,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 39,
      "timestamp": "2026-02-24T21:54:08.230032+00:00",
      "recommended_action": "continue",
      "mean_cost": 17016.21,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17016.21,
          "mean_cost_components": {
            "operating_travel": 349.04,
            "delay_service": 2328.23,
            "spoilage": 14338.94
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 40,
    "gps": {
      "t": 1771970887,
      "truck_id": 40,
      "timestamp": "2026-02-24T22:08:07.881593+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 47.39,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 40,
      "timestamp": "2026-02-24T22:08:07.881606+00:00",
      "temperature_c": 61.88,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 113576.41,
      "remaining_slack_min": -176.14,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 40,
      "timestamp": "2026-02-24T21:54:25.603666+00:00",
      "recommended_action": "continue",
      "mean_cost": 12238.12,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12238.12,
          "mean_cost_components": {
            "operating_travel": 341.16,
            "delay_service": 2390.17,
            "spoilage": 9506.79
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 41,
    "gps": {
      "t": 1771970887,
      "truck_id": 41,
      "timestamp": "2026-02-24T22:08:07.881658+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 47.97,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 41,
      "timestamp": "2026-02-24T22:08:07.881671+00:00",
      "temperature_c": 48.58,
      "humidity_pct": 92.93,
      "door_open": false,
      "shipment_value": 108238.88,
      "remaining_slack_min": -96.76,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 41,
      "timestamp": "2026-02-24T21:54:25.603766+00:00",
      "recommended_action": "continue",
      "mean_cost": 16748.46,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16748.46,
          "mean_cost_components": {
            "operating_travel": 345.47,
            "delay_service": 2281.1,
            "spoilage": 14121.88
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 42,
    "gps": {
      "t": 1771970887,
      "truck_id": 42,
      "timestamp": "2026-02-24T22:08:07.881724+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 52.01,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 42,
      "timestamp": "2026-02-24T22:08:07.881738+00:00",
      "temperature_c": 31.12,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 99934.21,
      "remaining_slack_min": -157.69,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 42,
      "timestamp": "2026-02-24T21:54:25.603868+00:00",
      "recommended_action": "continue",
      "mean_cost": 12228.3,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12228.3,
          "mean_cost_components": {
            "operating_travel": 350.47,
            "delay_service": 2367.61,
            "spoilage": 9510.22
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 43,
    "gps": {
      "t": 1771970887,
      "truck_id": 43,
      "timestamp": "2026-02-24T22:08:07.881790+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 51.08,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 43,
      "timestamp": "2026-02-24T22:08:07.881803+00:00",
      "temperature_c": 35.7,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 99276.04,
      "remaining_slack_min": -93.41,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 43,
      "timestamp": "2026-02-24T21:53:59.530549+00:00",
      "recommended_action": "continue",
      "mean_cost": 12075.46,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12075.46,
          "mean_cost_components": {
            "operating_travel": 361.41,
            "delay_service": 2277.71,
            "spoilage": 9436.35
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 44,
    "gps": {
      "t": 1771970887,
      "truck_id": 44,
      "timestamp": "2026-02-24T22:08:07.881855+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 48.22,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 44,
      "timestamp": "2026-02-24T22:08:07.881868+00:00",
      "temperature_c": 48.84,
      "humidity_pct": 94.79,
      "door_open": false,
      "shipment_value": 73004.2,
      "remaining_slack_min": -128.96,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 44,
      "timestamp": "2026-02-24T21:54:25.604064+00:00",
      "recommended_action": "continue",
      "mean_cost": 17054.68,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17054.68,
          "mean_cost_components": {
            "operating_travel": 354.24,
            "delay_service": 2344.38,
            "spoilage": 14356.06
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 45,
    "gps": {
      "t": 1771970887,
      "truck_id": 45,
      "timestamp": "2026-02-24T22:08:07.881920+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 54.98,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 45,
      "timestamp": "2026-02-24T22:08:07.881933+00:00",
      "temperature_c": 103.43,
      "humidity_pct": 94.91,
      "door_open": false,
      "shipment_value": 108728.62,
      "remaining_slack_min": -180.77,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 45,
      "timestamp": "2026-02-24T21:54:16.922540+00:00",
      "recommended_action": "continue",
      "mean_cost": 17294.1,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17294.1,
          "mean_cost_components": {
            "operating_travel": 339.53,
            "delay_service": 2431.04,
            "spoilage": 14523.53
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 46,
    "gps": {
      "t": 1771970887,
      "truck_id": 46,
      "timestamp": "2026-02-24T22:08:07.881986+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 49.88,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 46,
      "timestamp": "2026-02-24T22:08:07.881999+00:00",
      "temperature_c": 88.06,
      "humidity_pct": 94.74,
      "door_open": false,
      "shipment_value": 36337.4,
      "remaining_slack_min": -131.43,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 46,
      "timestamp": "2026-02-24T21:54:08.230353+00:00",
      "recommended_action": "continue",
      "mean_cost": 16882.23,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16882.23,
          "mean_cost_components": {
            "operating_travel": 349.4,
            "delay_service": 2324.02,
            "spoilage": 14208.81
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 47,
    "gps": {
      "t": 1771970887,
      "truck_id": 47,
      "timestamp": "2026-02-24T22:08:07.882052+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 45.81,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 47,
      "timestamp": "2026-02-24T22:08:07.882065+00:00",
      "temperature_c": 48.51,
      "humidity_pct": 94.69,
      "door_open": false,
      "shipment_value": 93273.35,
      "remaining_slack_min": -263.96,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 47,
      "timestamp": "2026-02-24T21:54:34.310927+00:00",
      "recommended_action": "continue",
      "mean_cost": 17037.24,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "32.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 17037.24,
          "mean_cost_components": {
            "operating_travel": 315.49,
            "delay_service": 2485.39,
            "spoilage": 14236.36
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 18,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 48,
    "gps": {
      "t": 1771970887,
      "truck_id": 48,
      "timestamp": "2026-02-24T22:08:07.882118+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 49.85,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 48,
      "timestamp": "2026-02-24T22:08:07.882131+00:00",
      "temperature_c": 65.63,
      "humidity_pct": "95.0",
      "door_open": true,
      "shipment_value": 109239.71,
      "remaining_slack_min": -270.58,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "48.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 48,
      "timestamp": "2026-02-24T21:54:25.604454+00:00",
      "recommended_action": "continue",
      "mean_cost": 12426.62,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "48.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 12426.62,
          "mean_cost_components": {
            "operating_travel": 353.58,
            "delay_service": 2494.51,
            "spoilage": 9578.53
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 17,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  },
  {
    "truck_id": 49,
    "gps": {
      "t": 1771970887,
      "truck_id": 49,
      "timestamp": "2026-02-24T22:08:07.882183+00:00",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 44.71,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "sensor": {
      "t": 1771970887,
      "truck_id": 49,
      "timestamp": "2026-02-24T22:08:07.882196+00:00",
      "temperature_c": 105.98,
      "humidity_pct": 94.9,
      "door_open": false,
      "shipment_value": 70543.19,
      "remaining_slack_min": -138.02,
      "violation_min": "0.0",
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": "32.0",
      "edge_progress_frac": "0.0"
    },
    "decision": {
      "truck_id": 49,
      "timestamp": "2026-02-24T21:55:00.411929+00:00",
      "recommended_action": "continue",
      "mean_cost": 16891.34,
      "all_actions": [
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "32.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16891.34,
          "mean_cost_components": {
            "operating_travel": 317.87,
            "delay_service": 2352.54,
            "spoilage": 14220.93
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 18,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [
          19
        ]
      },
      "mc_samples": 300
    }
  }
]

export const staticFleetStats: any = {
  "counts": {
    "trucks": 50,
    "gpsRecords": 60,
    "sensorRecords": 60,
    "decisionRecords": 60
  },
  "timeRange": {
    "oldest": "2026-02-24T22:08:06.790850+00:00",
    "newest": "2026-02-24T22:08:07.882118+00:00"
  },
  "averages": {
    "temperature_c": 73.9884,
    "humidity_pct": 94.27819999999998,
    "speed_mph": 49.4692
  }
}
