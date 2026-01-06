# app/controllers/mitigation_controller.py
from flask import Blueprint, request, jsonify
from app.services.mitigation_service import MitigationService
from app.services.audit_log_service import log_action
from app.models.vulnerability import Vulnerability

mitigation_bp = Blueprint("mitigation", __name__)


@mitigation_bp.route("/api/mitigations", methods=["GET"])
def get_mitigations():
    """Get all mitigations with optional filtering"""
    try:
        status = request.args.get("status")
        priority = request.args.get("priority")
        search = request.args.get("search")

        mitigations = MitigationService.get_all_mitigations(
            status=status,
            priority=priority,
            search=search,
        )
        return jsonify([m.to_dict() for m in mitigations]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mitigation_bp.route("/api/mitigations/<int:mitigation_id>", methods=["GET"])
def get_mitigation(mitigation_id):
    """Get a specific mitigation by ID"""
    try:
        mitigation = MitigationService.get_mitigation_by_id(mitigation_id)
        if mitigation:
            return jsonify(mitigation.to_dict()), 200
        return jsonify({"error": "Mitigation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mitigation_bp.route("/api/mitigations", methods=["POST"])
def create_mitigation():
    """Create a new mitigation"""
    try:
        data = request.get_json()

        required_fields = ["title", "description", "vulnerability_id"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        mitigation = MitigationService.create_mitigation(data)

        # Resolve CVE for audit message
        vuln = Vulnerability.query.get(mitigation.vulnerability_id)
        cve = vuln.cve_id if vuln else f"id={mitigation.vulnerability_id}"

        log_action(f"Created mitigation {mitigation.id} for vulnerability {cve}")

        return jsonify(mitigation.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mitigation_bp.route("/api/mitigations/<int:mitigation_id>", methods=["PUT"])
def update_mitigation(mitigation_id):
    """Update an existing mitigation"""
    try:
        data = request.get_json()
        mitigation = MitigationService.update_mitigation(mitigation_id, data)
        if mitigation:
            vuln = Vulnerability.query.get(mitigation.vulnerability_id)
            cve = vuln.cve_id if vuln else f"id={mitigation.vulnerability_id}"

            log_action(f"Updated mitigation {mitigation_id} for vulnerability {cve}")
            return jsonify(mitigation.to_dict()), 200
        else:
            return jsonify({"error": "Mitigation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mitigation_bp.route("/api/mitigations/<int:mitigation_id>", methods=["DELETE"])
def delete_mitigation(mitigation_id):
    """Delete a mitigation"""
    try:
        success = MitigationService.delete_mitigation(mitigation_id)
        if success:
            log_action(f"Deleted mitigation {mitigation_id}")
            return jsonify({"message": "Mitigation deleted successfully"}), 200
        else:
            return jsonify({"error": "Mitigation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mitigation_bp.route("/api/mitigations/stats", methods=["GET"])
def get_mitigation_stats():
    """Get mitigation statistics for dashboard"""
    try:
        stats = MitigationService.get_mitigation_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
